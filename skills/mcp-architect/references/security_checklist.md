# MCP Security Checklist

Use this checklist to audit any MCP server implementation before deployment.

## 1. Input Validation (High Priority)
- [ ] **Schema Strictness**: All tool arguments have explicit types and descriptions.
- [ ] **Pydantic/Zod**: Use validation libraries for every tool entry point.
- [ ] **Type Coercion**: Beware of automatic type conversion that could lead to unexpected behavior.

## 2. Resource Protection
- [ ] **Path Traversal**: Validate URI template parameters to prevent `../../` escapes.
- [ ] **Path Normalization**: Always `Path(p).resolve()` before accessing the file system.
- [ ] **Deny-by-Default**: Only expose specific directories, not the whole disk.

## 3. Tool Side-Effects
- [ ] **Destructive Actions**: Use "Confirm-Before-Execute" for deletions or bulk updates.
- [ ] **Rate Limiting**: Implement basic throttling for expensive operations (e.g., API calls).
- [ ] **Timeouts**: Ensure tool functions have reasonable timeouts to prevent hanging the server.

## 4. Transport & Environment
- [ ] **Secret Management**: **NEVER** hardcode API keys. Use environment variables.
- [ ] **STDIO Safety**: Ensure `print()` is not used for logging (use `sys.stderr` or `ctx.info`).
- [ ] **SSE Authentication**: If using SSE, verify tokens or use VPN/VPC tunneling.

## 5. Metadata Privacy
- [ ] **_meta usage**: Ensure internal IDs or sensitive session data are stored in `_meta` (hidden from the model) if returning `CallToolResult`.
- [ ] **Stack Traces**: Catch internal exceptions and return a sanitized error message to the client. Do not reveal server internals.
