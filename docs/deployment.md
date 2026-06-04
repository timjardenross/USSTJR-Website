# USS TJR — Deployment

## Deployment Model

USS TJR remains a static GitHub Pages website. Production deployment is handled by GitHub Actions and GitHub Pages; no external hosting, containers, build tools, or frameworks are required.

The intended release path is:

```text
feature branch
pull request
validation and Playwright tests
approval
merge to main
production deploy
production smoke test
```

## Workflows

- `USS TJR Validation` runs static syntax checks, repository structure checks, behavior checks, and Playwright E2E tests on pull requests and pushes to `main`.
- `USS TJR Production Deploy` runs the same quality gates on pushes to `main`, prepares the static Pages artifact, deploys to GitHub Pages, and then runs production smoke tests against the deployed URL.

Deployment is blocked when validation or Playwright tests fail.

## Deployment Artifact

The Pages artifact is prepared by:

```sh
node scripts/prepare-pages-artifact.js
```

The artifact includes:

- `index.html`
- `captains-log.html`
- `medical-bay.html`
- `css/`
- `js/`
- `docs/`
- `version.json`
- `.nojekyll`

## Deployment Metadata

Every deployment artifact includes `version.json` with:

- `buildVersion`
- `deploymentDate`
- `gitCommitSha`
- `repository`

Use this file to confirm which GitHub Actions run and commit are currently published.

## Production Verification

After deployment, GitHub Actions runs:

```sh
npm run test:prod
```

Production smoke checks verify:

- `index.html` loads
- `captains-log.html` loads
- `medical-bay.html` loads
- Main headings are visible
- Core controls are visible
- Confirmation modal is hidden on load
- No JavaScript page errors are reported
- `version.json` is available

## Manual Verification

Open the GitHub Pages URL and verify:

1. Command Deck loads and the confirmation modal is hidden.
2. Captain's Log loads, generates markdown, saves status, and can reset through confirmation.
3. Medical Bay loads, saves a health log, and can reset through confirmation.
4. `version.json` shows the expected commit SHA.

## Rollback

To rollback production:

1. Identify the last known good commit in GitHub.
2. Revert the faulty commit or commits on a new branch:

```sh
git revert <bad-commit-sha>
```

3. Open a pull request.
4. Wait for validation and Playwright tests to pass.
5. Merge to `main`.
6. Confirm the production deploy workflow succeeds.
7. Check `version.json` and run manual smoke verification.

If GitHub Pages is unhealthy because of a workflow or Pages configuration problem:

1. Open repository settings.
2. Go to **Pages**.
3. Confirm the source is **GitHub Actions**.
4. Re-run the latest successful `USS TJR Production Deploy` workflow.
5. If needed, temporarily redeploy the last known good commit by reverting and merging through the normal workflow.

Do not bypass validation unless production is already down and a documented emergency rollback is required.

---

## Related Documentation

- [Architecture](architecture.md) — system design and CI pipeline diagram
- [Testing](testing.md) — full test suite documentation
- [Runbook](runbook.md) — step-by-step operational procedures including rollback
