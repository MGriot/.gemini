# Platform-Specific Best Practices

## GitHub
*   **Landing Page:** README.md is automatically rendered. Use `.github/` folder for templates.
*   **GitHub Pages:** Source from `/docs` or `gh-pages` branch. Use Actions for auto-builds.
*   **Community:** Use Discussions for Q&A and PR templates to enforce doc updates.

## GitLab
*   **Wiki:** Integrated, versioned Markdown pages. Use for non-versioned internal notes.
*   **GitLab Pages:** Deployed via `.gitlab-ci.yml` artifacts.
*   **MR Approvals:** Use Merge Request approvals to ensure documentation is updated alongside code.

## Comparison

| Feature | GitHub Practice | GitLab Practice |
| :--- | :--- | :--- |
| **Templates** | `.github/` folder | Repository templates |
| **Hosting** | Actions auto-build | `.gitlab-ci.yml` artifacts |
| **Collaboration** | Discussions, Projects | Wiki, Epics, Boards |
| **Enforcement** | CI checks, PR templates | MR approvals, snippets |
