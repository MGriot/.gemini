#!/usr/bin/env python3
"""
test_analysis.py — Phase 7: Test coverage and quality analysis.

Usage: python3 test_analysis.py <repo_path> [--output text|json]
"""

import os
import re
import sys
import json
import argparse
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import List, Dict
from collections import defaultdict
import xml.etree.ElementTree as ET


SKIP_DIRS = {".git", "node_modules", "__pycache__", "dist", "build", "target", "vendor"}


@dataclass
class TestFile:
    path: str
    framework: str
    test_count: int
    assertion_count: int
    has_mocks: bool
    has_fixtures: bool
    test_type: str   # unit, integration, e2e, snapshot, unknown


@dataclass
class TestReport:
    total_test_files: int
    total_source_files: int
    test_ratio: float
    total_tests: int
    total_assertions: int
    frameworks: List[str]
    test_types: Dict[str, int]
    coverage_pct: float
    coverage_source: str
    test_files: List[TestFile]
    recommendations: List[str]


# Framework detection patterns
FRAMEWORK_PATTERNS = {
    "pytest":       r'import pytest|from pytest|@pytest\.',
    "unittest":     r'import unittest|class \w+\(.*TestCase\)',
    "doctest":      r'>>>\s+\w+|doctest',
    "jest":         r'describe\(|it\(|test\(|expect\(',
    "mocha":        r'describe\(|it\(|before\(|after\(',
    "jasmine":      r'describe\(|it\(|expect\(|jasmine\.',
    "vitest":       r'import.*vitest|from.*vitest',
    "cypress":      r'cy\.|describe\(.*cypress',
    "playwright":   r'from @playwright|import playwright',
    "rspec":        r'describe\s|it\s|expect\(',
    "minitest":     r'class.*Minitest|assert_',
    "junit":        r'@Test|import org\.junit|@BeforeEach',
    "testng":       r'@Test|import org\.testng',
    "go-testing":   r'func Test\w+\(t \*testing\.T\)',
    "rust-tests":   r'#\[test\]|#\[cfg\(test\)\]',
}

TEST_FILE_PATTERNS = [
    r'test_\w+\.py$', r'\w+_test\.py$',
    r'\w+\.test\.[jt]sx?$', r'\w+\.spec\.[jt]sx?$',
    r'__tests__', r'test_\w+\.rb$', r'\w+_spec\.rb$',
    r'\w+Test\.java$', r'\w+Tests\.java$',
    r'\w+_test\.go$',
    r'\w+_test\.rs$',
    r'test_\w+\.php$', r'\w+Test\.php$',
]

ASSERTION_PATTERNS = [
    r'\bassert\b', r'\bassert_', r'assertEqual', r'assertTrue', r'assertFalse',
    r'assertRaises', r'expect\(', r'should\.',
    r'\.toBe\(', r'\.toEqual\(', r'\.toHaveBeenCalled',
    r'\.assert\(', r'check!', r'require!',
]

MOCK_PATTERNS = [
    r'mock\.|MagicMock|patch\(|@patch',
    r'jest\.mock|jest\.fn|vi\.mock|vi\.fn',
    r'sinon\.|stub\(|spy\(',
    r'double\(|allow\(|expect_any\(',
]

FIXTURE_PATTERNS = [
    r'@pytest\.fixture', r'setUp\(', r'tearDown\(',
    r'beforeEach\(', r'afterEach\(', r'before\(', r'after\(',
    r'factory_bot', r'FactoryBot', r'fixture\(',
]


def detect_test_type(filepath: Path, content: str) -> str:
    path_str = str(filepath).lower()
    if "e2e" in path_str or "cypress" in content.lower() or "playwright" in content.lower():
        return "e2e"
    if "integration" in path_str or "integration" in content.lower()[:200]:
        return "integration"
    if "snapshot" in content.lower() or "toMatchSnapshot" in content or "toMatchInlineSnapshot" in content:
        return "snapshot"
    if "load" in path_str or "perf" in path_str or "benchmark" in path_str:
        return "load/performance"
    return "unit"


def analyze_test_file(filepath: Path, repo_root: Path) -> TestFile:
    relative = str(filepath.relative_to(repo_root))
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return TestFile(relative, "unknown", 0, 0, False, False, "unit")

    # Detect framework
    framework = "unknown"
    for fw, pattern in FRAMEWORK_PATTERNS.items():
        if re.search(pattern, content, re.MULTILINE):
            framework = fw
            break

    # Count test functions
    test_count = 0
    test_count += len(re.findall(r'\bdef test_\w+\b', content))
    test_count += len(re.findall(r'\bit\s*\(', content))
    test_count += len(re.findall(r'\btest\s*\(', content))
    test_count += len(re.findall(r'func Test\w+\(', content))
    test_count += len(re.findall(r'#\[test\]', content))
    test_count += len(re.findall(r'@Test\b', content))
    test_count = max(test_count, 1) if any(
        re.search(p, content, re.MULTILINE) for p in FRAMEWORK_PATTERNS.values()
    ) else test_count

    # Count assertions
    assertion_count = sum(
        len(re.findall(p, content)) for p in ASSERTION_PATTERNS
    )

    has_mocks = any(re.search(p, content) for p in MOCK_PATTERNS)
    has_fixtures = any(re.search(p, content) for p in FIXTURE_PATTERNS)
    test_type = detect_test_type(filepath, content)

    return TestFile(relative, framework, test_count, assertion_count, has_mocks, has_fixtures, test_type)


def is_test_file(filepath: Path) -> bool:
    name = filepath.name
    path_str = str(filepath)
    for pattern in TEST_FILE_PATTERNS:
        if re.search(pattern, name, re.I):
            return True
    if any(part in path_str for part in ["/tests/", "/test/", "/__tests__/", "/spec/", "/specs/"]):
        return True
    return False


def is_source_file(filepath: Path) -> bool:
    if is_test_file(filepath):
        return False
    ext = filepath.suffix.lower()
    return ext in {".py", ".js", ".jsx", ".ts", ".tsx", ".go", ".rs", ".java", ".rb", ".php", ".kt", ".cs", ".swift", ".c", ".cpp"}


def parse_coverage_xml(repo_path: Path) -> tuple:
    """Try to parse existing coverage reports."""
    # Python coverage.xml
    for cov_file in ["coverage.xml", "htmlcov/coverage.xml", "coverage/coverage.xml"]:
        p = repo_path / cov_file
        if p.exists():
            try:
                tree = ET.parse(p)
                root = tree.getroot()
                pct = float(root.attrib.get("line-rate", 0)) * 100
                return round(pct, 1), cov_file
            except Exception:
                pass

    # LCOV (lcov.info)
    for lcov_file in ["lcov.info", "coverage/lcov.info", "coverage/lcov.info"]:
        p = repo_path / lcov_file
        if p.exists():
            try:
                content = p.read_text()
                lines_found = sum(int(m.group(1)) for m in re.finditer(r'^LF:(\d+)', content, re.M))
                lines_hit = sum(int(m.group(1)) for m in re.finditer(r'^LH:(\d+)', content, re.M))
                if lines_found > 0:
                    pct = lines_hit / lines_found * 100
                    return round(pct, 1), lcov_file
            except Exception:
                pass

    # Jest coverage-summary.json
    for jcov in ["coverage/coverage-summary.json", "coverage-summary.json"]:
        p = repo_path / jcov
        if p.exists():
            try:
                data = json.loads(p.read_text())
                total = data.get("total", {})
                lines = total.get("lines", {}).get("pct", 0)
                return round(lines, 1), jcov
            except Exception:
                pass

    return -1, "none"


def run(repo_path_str: str, output_format: str = "text"):
    repo_path = Path(repo_path_str).resolve()
    if not repo_path.exists():
        print(f"ERROR: {repo_path} does not exist", file=sys.stderr)
        sys.exit(1)

    test_files_data: List[TestFile] = []
    source_file_count = 0

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            fpath = Path(root) / fname
            if is_test_file(fpath):
                test_files_data.append(analyze_test_file(fpath, repo_path))
            elif is_source_file(fpath):
                source_file_count += 1

    frameworks_found = list(set(t.framework for t in test_files_data if t.framework != "unknown"))
    test_types = defaultdict(int)
    for t in test_files_data:
        test_types[t.test_type] += 1

    total_tests = sum(t.test_count for t in test_files_data)
    total_assertions = sum(t.assertion_count for t in test_files_data)
    test_ratio = len(test_files_data) / max(source_file_count, 1)

    coverage_pct, coverage_source = parse_coverage_xml(repo_path)

    recs = []
    if len(test_files_data) == 0:
        recs.append("CRITICAL: No test files found. Add tests immediately.")
    elif test_ratio < 0.2:
        recs.append(f"Low test-to-source ratio ({test_ratio:.0%}). Aim for at least 0.5.")
    if coverage_pct > 0 and coverage_pct < 60:
        recs.append(f"Coverage at {coverage_pct}% is below 60% recommended minimum.")
    if test_types.get("integration", 0) == 0 and len(test_files_data) > 5:
        recs.append("No integration tests detected. Add tests that verify component interactions.")
    if test_types.get("e2e", 0) == 0 and source_file_count > 20:
        recs.append("No end-to-end tests detected. Consider adding E2E tests for critical user flows.")
    files_without_mocks = [t for t in test_files_data if not t.has_mocks and t.test_type == "unit"]
    if len(files_without_mocks) > len(test_files_data) * 0.5:
        recs.append("Many unit test files lack mocking. Tests may have hidden external dependencies.")

    report = TestReport(
        total_test_files=len(test_files_data),
        total_source_files=source_file_count,
        test_ratio=round(test_ratio, 2),
        total_tests=total_tests,
        total_assertions=total_assertions,
        frameworks=frameworks_found,
        test_types=dict(test_types),
        coverage_pct=coverage_pct,
        coverage_source=coverage_source,
        test_files=test_files_data,
        recommendations=recs,
    )

    if output_format == "json":
        print(json.dumps(asdict(report), indent=2))
        return

    print(f"\n{'='*60}")
    print(f"  TEST ANALYSIS: {repo_path.name}")
    print(f"{'='*60}")
    print(f"\nTest files:     {report.total_test_files}")
    print(f"Source files:   {report.total_source_files}")
    print(f"Test ratio:     {report.test_ratio:.0%}  {'✓' if report.test_ratio >= 0.5 else '⚠ low'}")
    print(f"Total tests:    {report.total_tests}")
    print(f"Total asserts:  {report.total_assertions}")

    if coverage_pct >= 0:
        cov_flag = "✓" if coverage_pct >= 60 else "⚠"
        print(f"Coverage:       {coverage_pct}%  {cov_flag}  (from {coverage_source})")
    else:
        print(f"Coverage:       not measured (no coverage report found)")

    if frameworks_found:
        print(f"\nFrameworks:     {', '.join(frameworks_found)}")

    if test_types:
        print(f"\nTest types:")
        for t, count in sorted(test_types.items(), key=lambda x: -x[1]):
            print(f"  {t:<20} {count} file(s)")

    if recs:
        print(f"\nRecommendations:")
        for r in recs:
            print(f"  → {r}")

    # Highlight files with no assertions
    empty_tests = [t for t in test_files_data if t.assertion_count == 0 and t.test_count > 0]
    if empty_tests:
        print(f"\nTest files with no assertions ({len(empty_tests)}) - may be testing nothing:")
        for t in empty_tests[:5]:
            print(f"  {t.path}")

    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test coverage analysis")
    parser.add_argument("repo_path")
    parser.add_argument("--output", choices=["text", "json"], default="text")
    args = parser.parse_args()
    run(args.repo_path, args.output)
