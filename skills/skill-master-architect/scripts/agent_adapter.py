"""Agent adapter for platform-agnostic skill testing.

Allows configuring how to call the agent (e.g., via CLI or API).
"""

import json
import os
import select
import subprocess
import time
import uuid
from pathlib import Path


class AgentAdapter:
    """Base class for an agent adapter."""

    def run_query(self, query: str, skill_name: str, skill_description: str, project_root: str, model: str | None = None) -> bool:
        """Run a query and return whether the skill was triggered.

        Args:
            query: The user's query to the agent.
            skill_name: Name of the skill being tested.
            skill_description: Description of the skill.
            project_root: Root directory of the project.
            model: Optional model identifier.

        Returns:
            bool: True if the skill was triggered/read, False otherwise.
        """
        raise NotImplementedError


class ClaudeAgentAdapter(AgentAdapter):
    """Adapter for 'claude' CLI (Claude Code)."""

    def run_query(self, query: str, skill_name: str, skill_description: str, project_root: str, model: str | None = None) -> bool:
        """Run a query and return whether the skill was triggered.

        Creates a command file in .claude/commands/ so it appears in Claude's
        available_skills list, then runs `claude -p` with the raw query.
        Uses --include-partial-messages to detect triggering early from
        stream events (content_block_start) rather than waiting for the
        full assistant message.
        """
        unique_id = uuid.uuid4().hex[:8]
        clean_name = f"{skill_name}-skill-{unique_id}"
        project_commands_dir = Path(project_root) / ".claude" / "commands"
        command_file = project_commands_dir / f"{clean_name}.md"

        timeout = 120  # Total timeout for the query

        try:
            project_commands_dir.mkdir(parents=True, exist_ok=True)
            # Use YAML block scalar to avoid breaking on quotes in description
            indented_desc = "\n  ".join(skill_description.split("\n"))
            command_content = (
                f"---\n"
                f"description: |\n"
                f"  {indented_desc}\n"
                f"---\n\n"
                f"# {skill_name}\n\n"
                f"This skill handles: {skill_description}\n"
            )
            command_file.write_text(command_content)

            cmd = [
                "claude",
                "-p", query,
                "--output-format", "stream-json",
                "--verbose",
                "--include-partial-messages",
            ]
            if model:
                cmd.extend(["--model", model])

            # Remove CLAUDECODE env var to allow nesting claude -p inside a
            # Claude Code session.
            env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

            # Use shell=True on Windows to find .cmd/.ps1 scripts
            import platform
            use_shell = platform.system() == "Windows"

            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                cwd=project_root,
                env=env,
                shell=use_shell
            )

            triggered = False
            start_time = time.time()
            buffer = ""
            pending_tool_name = None
            accumulated_json = ""

            try:
                while time.time() - start_time < timeout:
                    if process.poll() is not None:
                        remaining = process.stdout.read()
                        if remaining:
                            buffer += remaining.decode("utf-8", errors="replace")
                        break

                    ready, _, _ = select.select([process.stdout], [], [], 1.0)
                    if not ready:
                        continue

                    chunk = os.read(process.stdout.fileno(), 8192)
                    if not chunk:
                        break
                    buffer += chunk.decode("utf-8", errors="replace")

                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        line = line.strip()
                        if not line:
                            continue

                        try:
                            event = json.loads(line)
                        except json.JSONDecodeError:
                            continue

                        # Early detection via stream events
                        if event.get("type") == "stream_event":
                            se = event.get("event", {})
                            se_type = se.get("type", "")

                            if se_type == "content_block_start":
                                cb = se.get("content_block", {})
                                if cb.get("type") == "tool_use":
                                    tool_name = cb.get("name", "")
                                    # Trigger can be 'Skill' or 'Read' (if it's a file)
                                    if tool_name in ("Skill", "Read", "activate_skill"):
                                        pending_tool_name = tool_name
                                        accumulated_json = ""
                                    else:
                                        # If it uses another tool first, it might still trigger later,
                                        # but usually it's a sign it won't. We'll keep going.
                                        pass

                            elif se_type == "content_block_delta" and pending_tool_name:
                                delta = se.get("delta", {})
                                if delta.get("type") == "input_json_delta":
                                    accumulated_json += delta.get("partial_json", "")
                                    if clean_name in accumulated_json:
                                        return True

                            elif se_type in ("content_block_stop", "message_stop"):
                                if pending_tool_name:
                                    if clean_name in accumulated_json:
                                        return True
                                    pending_tool_name = None
                                if se_type == "message_stop":
                                    return False

                        # Fallback: full assistant message
                        elif event.get("type") == "assistant":
                            message = event.get("message", {})
                            for content_item in message.get("content", []):
                                if content_item.get("type") != "tool_use":
                                    continue
                                tool_name = content_item.get("name", "")
                                tool_input = content_item.get("input", {})
                                if tool_name in ("Skill", "activate_skill") and clean_name in str(tool_input):
                                    triggered = True
                                elif tool_name == "Read" and clean_name in tool_input.get("file_path", ""):
                                    triggered = True
                                return triggered

                        elif event.get("type") == "result":
                            return triggered
            finally:
                if process.poll() is None:
                    process.kill()
                    process.wait()

            return triggered
        finally:
            if command_file.exists():
                command_file.unlink()


class CLIAgentAdapter(AgentAdapter):
    """Adapter that calls a CLI-based agent (basic fallback)."""

    def run_query(self, query: str, skill_name: str, skill_description: str, project_root: str, model: str | None = None) -> bool:
        """Run a query via the CLI. Basic string matching on output.
        """
        env = os.environ.copy()
        if model:
            env["MODEL"] = model

        import platform
        use_shell = platform.system() == "Windows"

        try:
            result = subprocess.run(
                ["gemini", "--prompt", "", "--approval-mode", "plan"] + (["--model", model] if model else []),
                input=query,
                capture_output=True,
                text=True,
                cwd=project_root,
                timeout=120,
                env=env,
                encoding='utf-8',
                shell=use_shell
            )

            output = result.stdout + result.stderr
            if skill_name.lower() in output.lower():
                return True
            if "reading skill" in output.lower() or "activated skill" in output.lower() or skill_name in output:
                return True

            return False
        except Exception:
            return False


def get_adapter() -> AgentAdapter:
    """Factory to get the configured agent adapter."""
    # Detect if we are in a 'claude' (Claude Code) environment
    import shutil
    if shutil.which("claude"):
        return ClaudeAgentAdapter()
    return CLIAgentAdapter()
