# /// script
# requires-python = ">=3.10"
# dependencies = ["anthropic>=1.0", "mcp>=1.0", "httpx2"]
# ///
"""
MCP Server Evaluation Harness.

Runs an XML evaluation file against a live MCP server: for each question it
gives Claude the server's real tools, lets it work agentically until it answers,
then grades that answer against the expected one.

What it reports is not just pass/fail but *why* a question failed - which tools
were called, with what arguments, and whether any errored. That trace is the
point: a failing eval usually means a tool description was ambiguous or an error
message was not actionable, not that the model was incapable.

Usage:
    # stdio - the script launches and manages the server process itself
    uv run scripts/evaluation.py -t stdio -c python -a my_server.py evaluation.xml

    # http / sse - start the server separately first, then point at its URL
    uv run scripts/evaluation.py -t http -u https://example.com/mcp \
        -H "Authorization: Bearer token" evaluation.xml

Evaluation file format:
    <evaluation>
      <qa_pair>
        <question>Which project had the most completed tasks in Q2 2024?</question>
        <answer>Website Redesign</answer>
      </qa_pair>
    </evaluation>
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path

import anthropic
from mcp import Client
from mcp.client.stdio import StdioServerParameters

DEFAULT_MODEL = "claude-opus-5"
MAX_AGENT_TURNS = 20

GRADER_SYSTEM = """You grade answers to questions about data retrieved from an MCP server.

Compare the CANDIDATE answer to the EXPECTED answer. Grade on semantic
equivalence, not wording: "Website Redesign" and "the Website Redesign project"
are the same answer. Formatting, casing, and surrounding prose do not matter.
A candidate that contains the expected answer plus correct extra detail passes.
A candidate that hedges without committing, or names something different, fails.

Reply with a JSON object and nothing else:
{"verdict": "pass" | "fail", "reason": "<one sentence>"}"""


# ── Data model ────────────────────────────────────────────────────────────────

@dataclass
class QAPair:
    question: str
    answer: str


@dataclass
class ToolCall:
    name: str
    arguments: dict
    is_error: bool = False


@dataclass
class QuestionResult:
    question: str
    expected: str
    actual: str
    verdict: str          # pass | fail | error
    reason: str = ""
    tool_calls: list[ToolCall] = field(default_factory=list)
    turns: int = 0

    @property
    def failed_tool_calls(self) -> list[ToolCall]:
        return [c for c in self.tool_calls if c.is_error]


# ── Eval file parsing ─────────────────────────────────────────────────────────

def parse_eval_file(path: Path) -> list[QAPair]:
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as exc:
        raise SystemExit(f"ERROR: {path} is not valid XML - {exc}")

    pairs: list[QAPair] = []
    for i, node in enumerate(root.findall(".//qa_pair"), start=1):
        q = node.findtext("question")
        a = node.findtext("answer")
        if not q or not a:
            raise SystemExit(
                f"ERROR: qa_pair #{i} in {path} is missing a <question> or <answer>."
            )
        pairs.append(QAPair(question=q.strip(), answer=a.strip()))

    if not pairs:
        raise SystemExit(f"ERROR: no <qa_pair> elements found in {path}.")
    return pairs


# ── MCP plumbing ──────────────────────────────────────────────────────────────

def build_transport(args: argparse.Namespace):
    """Return whatever `Client(...)` should be constructed with for this transport."""
    if args.transport == "stdio":
        if not args.command:
            raise SystemExit("ERROR: -c/--command is required for stdio transport.")
        env = {}
        for item in args.env or []:
            if "=" not in item:
                raise SystemExit(f"ERROR: --env expects KEY=VALUE, got {item!r}.")
            key, _, value = item.partition("=")
            env[key] = value
        # The child gets only an allow-listed environment, so anything the server
        # needs (API keys, tokens) has to be passed explicitly via -e.
        return StdioServerParameters(
            command=args.command, args=args.args or [], env=env or None
        )

    if not args.url:
        raise SystemExit(f"ERROR: -u/--url is required for {args.transport} transport.")

    headers = {}
    for item in args.header or []:
        if ":" not in item:
            raise SystemExit(f"ERROR: --header expects 'Key: Value', got {item!r}.")
        key, _, value = item.partition(":")
        headers[key.strip()] = value.strip()

    if args.transport == "sse":
        from mcp.client.sse import sse_client
        return sse_client(args.url, headers=headers) if headers else sse_client(args.url)

    from mcp.client.streamable_http import streamable_http_client
    if not headers:
        return args.url
    import httpx2
    # We own this client, so we keep it alive for the run and close it ourselves.
    http_client = httpx2.AsyncClient(headers=headers)
    return streamable_http_client(args.url, http_client=http_client), http_client


def mcp_tools_to_anthropic(tools) -> list[dict]:
    """Convert MCP tool definitions into Anthropic tool definitions."""
    converted = []
    for tool in tools:
        schema = getattr(tool, "input_schema", None) or {"type": "object", "properties": {}}
        converted.append(
            {
                "name": tool.name,
                "description": tool.description or f"MCP tool: {tool.name}",
                "input_schema": schema,
            }
        )
    return converted


def flatten_tool_result(result) -> str:
    """Render an MCP tool result as text for the model."""
    structured = getattr(result, "structured_content", None)
    if structured is not None:
        return json.dumps(structured, indent=2, default=str)

    parts = []
    for block in getattr(result, "content", None) or []:
        text = getattr(block, "text", None)
        parts.append(text if text is not None else str(block))
    return "\n".join(parts) if parts else "(tool returned no content)"


# ── Agent loop ────────────────────────────────────────────────────────────────

async def answer_question(
    claude: anthropic.Anthropic,
    mcp_client,
    tools: list[dict],
    question: str,
    model: str,
) -> tuple[str, list[ToolCall], int]:
    """Let Claude use the server's tools until it produces a final answer."""
    messages: list[dict] = [{"role": "user", "content": question}]
    calls: list[ToolCall] = []

    for turn in range(1, MAX_AGENT_TURNS + 1):
        response = await asyncio.to_thread(
            claude.messages.create,
            model=model,
            max_tokens=16000,
            system=(
                "Answer the question using the available tools. Investigate as many "
                "times as you need, then state the final answer plainly. If the tools "
                "cannot answer it, say so explicitly rather than guessing."
            ),
            thinking={"type": "adaptive"},
            tools=tools,
            messages=messages,
        )

        if response.stop_reason == "refusal":
            return "(model refused to answer)", calls, turn

        if response.stop_reason != "tool_use":
            text = "\n".join(b.text for b in response.content if b.type == "text")
            return text.strip() or "(model returned no text)", calls, turn

        messages.append({"role": "assistant", "content": response.content})

        results = []
        for block in (b for b in response.content if b.type == "tool_use"):
            try:
                outcome = await mcp_client.call_tool(block.name, block.input or {})
                is_error = bool(getattr(outcome, "is_error", False))
                payload = flatten_tool_result(outcome)
            except Exception as exc:                      # noqa: BLE001 - surfaced to the model
                is_error, payload = True, f"{type(exc).__name__}: {exc}"

            calls.append(ToolCall(block.name, block.input or {}, is_error))
            results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": payload,
                    "is_error": is_error,
                }
            )

        messages.append({"role": "user", "content": results})

    return "(gave up: hit the turn limit without answering)", calls, MAX_AGENT_TURNS


async def grade(
    claude: anthropic.Anthropic, model: str, question: str, expected: str, actual: str
) -> tuple[str, str]:
    response = await asyncio.to_thread(
        claude.messages.create,
        model=model,
        max_tokens=1024,
        system=GRADER_SYSTEM,
        messages=[
            {
                "role": "user",
                "content": (
                    f"QUESTION:\n{question}\n\n"
                    f"EXPECTED:\n{expected}\n\n"
                    f"CANDIDATE:\n{actual}"
                ),
            }
        ],
    )
    text = "\n".join(b.text for b in response.content if b.type == "text").strip()
    try:
        start, end = text.index("{"), text.rindex("}") + 1
        parsed = json.loads(text[start:end])
        return parsed.get("verdict", "fail"), parsed.get("reason", "")
    except (ValueError, json.JSONDecodeError):
        return "fail", f"Could not parse grader output: {text[:200]}"


# ── Reporting ─────────────────────────────────────────────────────────────────

def render_report(results: list[QuestionResult], server_name: str) -> str:
    passed = sum(1 for r in results if r.verdict == "pass")
    total = len(results)
    pct = (passed / total * 100) if total else 0.0

    lines = [
        "=" * 68,
        f"  MCP Evaluation - {server_name}",
        f"  Passed: {passed}/{total}  ({pct:.0f}%)",
        "=" * 68,
        "",
    ]

    for i, r in enumerate(results, start=1):
        icon = {"pass": "PASS", "fail": "FAIL"}.get(r.verdict, "ERROR")
        lines.append(f"[{icon}] {i}. {r.question}")
        if r.verdict != "pass":
            lines.append(f"       expected : {r.expected}")
            lines.append(f"       got      : {r.actual[:300]}")
            if r.reason:
                lines.append(f"       reason   : {r.reason}")
        names = ", ".join(c.name for c in r.tool_calls) or "(none)"
        lines.append(f"       tools    : {len(r.tool_calls)} call(s) over {r.turns} turn(s) - {names}")
        for call in r.failed_tool_calls:
            lines.append(f"       errored  : {call.name}({json.dumps(call.arguments, default=str)[:120]})")
        lines.append("")

    errored = [c for r in results for c in r.failed_tool_calls]
    if errored:
        lines += [
            "-" * 68,
            "Tool errors are design feedback: an error the model could not recover",
            "from usually means the message did not say how to fix the call.",
            "",
        ]
        counts: dict[str, int] = {}
        for call in errored:
            counts[call.name] = counts.get(call.name, 0) + 1
        for name, n in sorted(counts.items(), key=lambda kv: -kv[1]):
            lines.append(f"  {n:>3}x  {name}")
        lines.append("")

    return "\n".join(lines)


# ── Entry point ───────────────────────────────────────────────────────────────

async def run(args: argparse.Namespace) -> int:
    pairs = parse_eval_file(Path(args.eval_file))

    claude = anthropic.Anthropic()

    transport = build_transport(args)
    owned_http_client = None
    if isinstance(transport, tuple):
        transport, owned_http_client = transport

    results: list[QuestionResult] = []
    fatal: str | None = None
    try:
        if owned_http_client is not None:
            await owned_http_client.__aenter__()

        async with Client(transport) as mcp_client:
            server_name = getattr(getattr(mcp_client, "server_info", None), "name", args.url or args.command)
            listed = await mcp_client.list_tools()
            tools = mcp_tools_to_anthropic(listed.tools)
            if not tools:
                raise SystemExit("ERROR: the server exposes no tools - nothing to evaluate.")

            print(f"Connected to {server_name!r}: {len(tools)} tool(s), {len(pairs)} question(s).\n",
                  file=sys.stderr)

            for i, pair in enumerate(pairs, start=1):
                print(f"  [{i}/{len(pairs)}] {pair.question[:70]}...", file=sys.stderr)
                try:
                    actual, calls, turns = await answer_question(
                        claude, mcp_client, tools, pair.question, args.model
                    )
                    verdict, reason = await grade(
                        claude, args.model, pair.question, pair.answer, actual
                    )
                except anthropic.AuthenticationError as exc:
                    fatal = (f"Anthropic rejected the credentials - {exc}\n"
                             "Set ANTHROPIC_API_KEY, or run `ant auth login` to store a profile.")
                    break
                except Exception as exc:                  # noqa: BLE001 - reported per question
                    # An unresolvable credential surfaces on the first request, not at
                    # construction. Abort rather than repeating it for every question.
                    if "Could not resolve authentication method" in str(exc):
                        fatal = ("no Anthropic credentials found.\n"
                                 "Set ANTHROPIC_API_KEY, or run `ant auth login` to store a profile.")
                        break
                    results.append(
                        QuestionResult(pair.question, pair.answer,
                                       f"{type(exc).__name__}: {exc}", "error")
                    )
                    continue

                results.append(
                    QuestionResult(pair.question, pair.answer, actual,
                                   verdict, reason, calls, turns)
                )
    finally:
        if owned_http_client is not None:
            await owned_http_client.__aexit__(None, None, None)

    if fatal:
        print(f"ERROR: {fatal}", file=sys.stderr)
        return 2

    report = render_report(results, str(server_name))
    if args.output:
        Path(args.output).write_text(report, encoding="utf-8")
        print(f"\nReport written to {args.output}", file=sys.stderr)
    else:
        print(report)

    return 0 if all(r.verdict == "pass" for r in results) else 1


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Evaluate an MCP server against an XML evaluation file."
    )
    parser.add_argument("eval_file", help="Path to evaluation XML file")
    parser.add_argument("-t", "--transport", choices=["stdio", "sse", "http"],
                        default="stdio", help="Transport type (default: stdio)")
    parser.add_argument("-m", "--model", default=DEFAULT_MODEL,
                        help=f"Claude model to use (default: {DEFAULT_MODEL})")
    parser.add_argument("-o", "--output", help="Write the report here instead of stdout")

    stdio = parser.add_argument_group("stdio options")
    stdio.add_argument("-c", "--command", help="Command that runs the MCP server (e.g. python, node)")
    stdio.add_argument("-a", "--args", nargs="+", help="Arguments for the command (e.g. server.py)")
    stdio.add_argument("-e", "--env", nargs="+", metavar="KEY=VALUE",
                       help="Environment variables passed to the server process")

    remote = parser.add_argument_group("sse/http options")
    remote.add_argument("-u", "--url", help="MCP server URL")
    remote.add_argument("-H", "--header", nargs="+", metavar="'Key: Value'",
                        help="HTTP headers sent with each request")

    args = parser.parse_args()
    try:
        return asyncio.run(run(args))
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())
