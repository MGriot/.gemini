---
name: test-expert
description: "Generate idiomatic, high-quality tests and place them where the project's conventions expect. Specialized for Python (pytest — fixtures, parametrize, monkeypatch, mocking), TypeScript/JavaScript (Vitest/Jest — spies, async, fake timers), and Go (table-driven tests, subtests, t.Cleanup). Use when the user asks to add tests, write a unit or integration test, improve coverage, set up a test suite, mock an external dependency, or turn a bug into a failing test. Trigger on 'write tests for', 'add test coverage', 'how do I test this', 'set up pytest/vitest/jest', or 'reproduce this bug as a test'."
---

# Test Expert

This skill helps you generate robust, idiomatic test code and ensure it is placed in the correct project location following industry best practices.

## Workflow

1.  **Detect Environment**: Identify language and framework (check `pyproject.toml`, `package.json`, `go.mod`).
2.  **Determine Location**:
    -   **Python**: `tests/` (root level) or `src/package/tests/`.
    -   **JS/TS**: `src/__tests__/` or `*.test.ts` collocated.
    -   **Go**: `*_test.go` collocated.
    -   **Java/Kotlin**: `src/test/java/`.
3.  **Generate Test Case**: 
    -   **AAA Pattern**: Arrange, Act, Assert.
    -   **Descriptive Names**: `test_should_return_404_when_user_not_found`.
    -   **Isolation**: Mock external I/O (DB, Network).
4.  **Verify**: Run the tests to prove they fail (RED) and then pass (GREEN).

## Deep Dive: Python (pytest)

Use `pytest` as the default unless strictly constrained to `unittest`.

### 1. The Basics
```python
def test_add_should_sum_two_numbers():
    # Arrange
    a, b = 2, 3
    # Act
    result = add(a, b)
    # Assert
    assert result == 5  # No self.assertEqual needed
```

### 2. Parametrization (Don't write loops)
```python
import pytest

@pytest.mark.parametrize("input_a, input_b, expected", [
    (1, 1, 2),
    (10, 20, 30),
    (-1, 1, 0),
])
def test_add_various_cases(input_a, input_b, expected):
    assert add(input_a, input_b) == expected
```

### 3. Fixtures (Setup/Teardown)
Use fixtures for reusable state. Scope them appropriately (`function`, `module`, `session`).
```python
@pytest.fixture
def sample_user():
    return User(name="Alice", age=30)

def test_user_age(sample_user):
    assert sample_user.age == 30
```

### 4. Mocking (External Dependencies)
Use `unittest.mock` (standard lib) or `pytest-mock` fixture.
```python
from unittest.mock import Mock

def test_api_call(mocker): # using pytest-mock
    # Arrange
    mock_api = mocker.patch("my_app.services.api_client.get")
    mock_api.return_value = {"status": "ok"}
    
    # Act
    result = fetch_data()
    
    # Assert
    assert result == "ok"
    mock_api.assert_called_once()
```

## Deep Dive: TypeScript (Vitest/Jest)

### 1. Async & Spies
```typescript
import { vi, describe, it, expect } from 'vitest';
import { UserService } from './user-service';

describe('UserService', () => {
  it('should save user', async () => {
    // Arrange
    const dbMock = { save: vi.fn().mockResolvedValue(true) };
    const service = new UserService(dbMock);
    
    // Act
    await service.register('alice');
    
    // Assert
    expect(dbMock.save).toHaveBeenCalledWith('alice');
  });
});
```

## Quality Gate Checklist

- [ ] **Location**: Is the file in the standard path?
- [ ] **Imports**: Are source modules imported correctly?
- [ ] **Style**: snake_case for Python tests, camelCase for JS/TS tests.
- [ ] **Behavior**: Does it test behavior, not implementation details?

---

## Deep Dive: Go

Go has no assertion library in the standard library and does not need one. Use table-driven
tests with subtests — they give you one failure per case, run in parallel, and name themselves.

```go
func TestParseDuration(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    time.Duration
        wantErr bool
    }{
        {name: "seconds", input: "30s", want: 30 * time.Second},
        {name: "minutes", input: "5m", want: 5 * time.Minute},
        {name: "empty", input: "", wantErr: true},
        {name: "garbage", input: "abc", wantErr: true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            got, err := ParseDuration(tt.input)
            if (err != nil) != tt.wantErr {
                t.Fatalf("ParseDuration(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
            }
            if err == nil && got != tt.want {
                t.Errorf("ParseDuration(%q) = %v, want %v", tt.input, got, tt.want)
            }
        })
    }
}
```

- **Naming**: `*_test.go`, collocated with the code under test. `TestXxx(t *testing.T)`.
- **Cleanup**: prefer `t.Cleanup(func(){ ... })` over `defer` — it runs even when a subtest
  calls `t.Fatal`, and it composes with helpers.
- **Helpers**: call `t.Helper()` first so failures report the caller's line, not the helper's.
- **Fatal vs Error**: `t.Fatal` stops the subtest (use when later assertions would panic);
  `t.Error` keeps going (use to report several independent mismatches at once).
- **Fakes over mocks**: accept an interface, pass a small struct that implements it. Go has
  no mocking framework in the stdlib and rarely needs one.
- **Golden files**: for large output, compare against `testdata/*.golden` behind a `-update`
  flag rather than embedding the expected text in the test.

---

## References

- **`references/testing-best-practices.md`** — language-specific conventions (naming, layout,
  coverage targets) and the general principles behind them. Read it when setting up a suite
  from scratch or when a project's existing conventions are unclear.
