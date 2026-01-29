# Software Testing Best Practices

This reference provides language-specific conventions and general best practices for software testing.

## General Principles

- **AAA Pattern (Arrange, Act, Assert)**:
    - **Arrange**: Set up the test environment (data, mocks, dependencies).
    - **Act**: Execute the code being tested.
    - **Assert**: Verify the results.
- **Isolation**: Each test should be independent and not depend on others.
- **Descriptive Naming**: Use clear names like `test_should_calculate_total_with_tax`.
- **Fast Execution**: Unit tests should be quick to run.
- **Coverage**: Aim for high coverage of business logic and edge cases.

## Language Specifics

### Python
- **Directory**: `tests/` or `test/` at the project root.
- **Naming**: Files as `test_*.py` or `*_test.py`. Functions/methods as `test_*`.
- **Frameworks**: `pytest` (preferred), `unittest`.
- **Note**: Include an empty `__init__.py` in `tests/` if using `unittest` or for specific discovery needs.

### JavaScript / TypeScript
- **Directory**: `tests/`, `__tests__/`, or collocated with source.
- **Naming**: `*.test.js/ts` or `*.spec.js/ts`.
- **Frameworks**: `Jest`, `Vitest`, `Mocha`.
- **Pattern**: If `src/` exists, `tests/` often mirrors its structure.

### Java
- **Directory**: `src/test/java/`.
- **Naming**: `*Test.java`.
- **Package**: Mirror the `src/main/java` package hierarchy.
- **Frameworks**: `JUnit`, `TestNG`.

### Go
- **Directory**: Same as the source file.
- **Naming**: `*_test.go`.
- **Framework**: Built-in `testing` package.

### Rust
- **Directory**: `tests/` for integration tests, or internal `mod tests` for unit tests.
- **Naming**: Integration tests as `tests/*.rs`.
