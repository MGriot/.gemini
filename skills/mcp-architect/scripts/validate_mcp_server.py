import sys
import os

def check_mcp_server(file_path):
    """Simple check for common MCP server mistakes."""
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    issues = []

    # Check for print statements (poisonous to STDIO transport)
    if "print(" in content and "sys.stderr" not in content:
        issues.append("[CRITICAL] Uses 'print()'. This will corrupt MCP STDIO transport. Use 'sys.stderr.write()' or 'ctx.info()'.")

    # Check for the high-level server class (renamed from FastMCP in mcp 2.x)
    if "MCPServer" not in content and "FastMCP" not in content:
        issues.append("[INFO] Consider using 'MCPServer' from mcp.server.mcpserver for a cleaner API.")

    # Flag the v1 import, which raises ModuleNotFoundError on mcp 2.x
    if "mcp.server.fastmcp" in content:
        issues.append("[CRITICAL] Imports 'mcp.server.fastmcp', removed in mcp 2.x. Use 'from mcp.server.mcpserver import MCPServer' (or pin 'mcp<2').")

    # Check for Pydantic/Validation
    if "pydantic" not in content.lower() and "mcp.tool" in content:
        issues.append("[WARNING] No explicit validation found (Pydantic). Ensure your tool arguments have strict type hints.")

    # Check for URI Template validation
    if ".resource(" in content and "resolve()" not in content:
        issues.append("[WARNING] URI Template detected but no path resolution/validation found. Risk of directory traversal.")

    if not issues:
        print("No obvious MCP antipatterns found.")
    else:
        print("Found the following issues:")
        for issue in issues:
            print(f" - {issue}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_mcp_server.py <path_to_server.py>")
    else:
        check_mcp_server(sys.argv[1])
