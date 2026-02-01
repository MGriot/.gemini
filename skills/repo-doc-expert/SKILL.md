---
name: repo-doc-expert
description: Expert guidance on project documentation structure, best practices, and platform-specific implementations (GitHub/GitLab). Use when creating or improving READMEs, contribution guides, or full project documentation.
---

# Repo Documentation Expert

## Overview

Use this skill to build professional, accessible, and collaborative project documentation. It follows the **Diátaxis framework** and provides specific best practices for essential repo files and platform-specific features.

## Core Principles: Diátaxis Framework

Organize documentation into four distinct quadrants to serve different user needs:

1.  **Tutorials:** Learning-oriented, hands-on lessons for beginners.
2.  **How-to Guides:** Task-oriented, practical steps for specific problems.
3.  **Reference:** Information-oriented, technical descriptions (API, CLI).
4.  **Explanation:** Understanding-oriented, background context and theory.

## Essential Files

Every professional repository should include:

- **README.md:** The user entry point and project overview.
- **CONTRIBUTING.md:** Guidelines for new contributors.
- **CODE_OF_CONDUCT.md:** Standards for community behavior.
- **LICENSE:** Legal terms of use.
- **CHANGELOG.md:** History of changes (Semantic Versioning).
- **SECURITY.md:** Vulnerability reporting process.

See `references/best-practices.md` for detailed checklists for each file.

## Repository Structure

Scalable structure for growing projects:

```text
project-repo/
├── README.md
├── LICENSE
├── .github/          # GitHub templates/workflows (or .gitlab/)
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/             # Full documentation (Diátaxis)
│   ├── tutorials/
│   ├── how-to/
│   ├── reference/
│   └── explanation/
├── src/              # Codebase
└── CHANGELOG.md
```

## Documentation Tools

- **Static Site Generators:** MkDocs (with Material theme), Docusaurus, Sphinx.
- **Hosting:** GitHub Pages, GitLab Pages.
- **Automation:** Use CI/CD to build, lint (Vale, markdownlint), and deploy docs on every push.

## Platforms & Templates

- **GitHub vs. GitLab:** See `references/platforms.md` for feature comparisons.
- **Starter Template:** Use `assets/README-template.md` to bootstrap a professional README.