# MCP API Patterns (FastMCP)

Reference guide for common FastMCP implementation patterns in Python.

## 1. Basic Server Setup
```python
from mcp.server.fastmcp import FastMCP

# Create a server instance
mcp = FastMCP("MyServer")
```

## 2. Defining Tools
```python
@mcp.tool()
async def fetch_issues(repo: str, state: str = "open") -> str:
    """Fetch GitHub issues for a specific repo. Use this tool for troubleshooting."""
    # Implementation here
    return f"Found 5 {state} issues in {repo}"
```

## 3. Context Injection (The Power Pattern)
```python
@mcp.tool()
async def long_running_task(ctx: Context) -> str:
    """A task that reports progress to the client."""
    await ctx.report_progress(0, 100)
    # ... do work ...
    ctx.info("Halfway there!")
    await ctx.report_progress(50, 100)
    return "Task Complete"
```

## 4. URI Template Resources
```python
@mcp.resource("logs://{project_id}/{date}")
def get_project_logs(project_id: str, date: str) -> str:
    """Get project logs for a specific date."""
    # Pattern: Validate project_id and date formats!
    return f"Logs for {project_id} on {date}: [Info] Everything is fine."
```

## 5. Prompt Templates
```python
@mcp.prompt()
def code_review(code: str) -> list[Message]:
    """Provides a prompt template for code review."""
    return [
        UserMessage(f"Review this code for security vulnerabilities:\n\n{code}")
    ]
```

## 6. Running the Server
```python
if __name__ == "__main__":
    # Runs the server over STDIO (default)
    mcp.run()
```
