# Documentation Best Practices

## README.md
*   **Structure:** Title with 3-5 dynamic badges (Shields.io), one-line summary, GIF demo (<10MB), Table of Contents.
*   **Quick Start:** Copy-paste ready code block with expected output.
*   **Maintenance:** Concise (scan in 30s), use real examples, link to full docs.

## CONTRIBUTING.md
*   **Onboarding:** Step-by-step dev setup, branching strategy (Git Flow), and commit conventions.
*   **Reporting:** Link to issue templates, require minimal reproduction steps for bugs.
*   **Process:** Explain the PR review cycle and recognition for contributors.

## CHANGELOG.md
*   **Format:** Follow [Keep a Changelog](https://keepachangelog.com/).
*   **Groups:** Added, Changed, Deprecated, Removed, Fixed, Security.
*   **Links:** Include links to PRs or Issues for transparency.

## SECURITY.md
*   **Reporting:** Provide a private contact (e.g., security@project.org).
*   **Policy:** Table of supported versions and expected response timelines.

## Advanced Topics
*   **Multi-Version Docs:** Use tools like `mike` for MkDocs to manage docs for different releases.
*   **API Docs:** Auto-generate from code (Swagger/OpenAPI) and embed in the Reference quadrant.
*   **Accessibility:** Use semantic Markdown, provide alt text for images, and test with screen readers.
*   **Internationalization (i18n):** Integrate with platforms like Crowdin or Weblate for translations.
