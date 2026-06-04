# USS TJR — Testing

The test suite runs in three layers. Each layer catches a different class of problem, and all three must pass before any change can be merged or deployed.

## Overview

| Layer | Tool | What it catches | Command |
|-------|------|----------------|---------|
| Static Checks | Node.js (no deps) | Missing files, broken links, bad naming | `node scripts/run-checks.js` |
| Behaviour Checks | Node.js (no deps) | Business logic correctness | `node scripts/run-checks.js` |
| E2E Tests | Playwright | User workflows, UI rendering | `npm test` |
| Production Smoke | Playwright | Live deployment health | `npm run test:prod` |

---

## Static Checks

**File:** `scripts/static-check.js`

Validates the repository structure and content without running any application code.

**Checks performed:**
- All 35 required files are present
- HTML files parse without errors
- CSS file parses without errors
- All CSS asset references resolve to real files
- All HTML internal links resolve to real files
- localStorage key names follow the `usstjr-*` convention
- No hardcoded credentials appear in comments
- No broken `import` statements in JavaScript modules

**Runs:** Always, as part of `npm test` and the `static-checks.yml` workflow.

---

## Behaviour Checks

**File:** `scripts/behavior-check.js`

Simulates application logic in a headless Node.js environment using a lightweight mock DOM. This verifies that business rules work correctly without needing a browser.

**Areas covered:**
- Draft save/load cycle (Captain's Log and Medical Bay)
- Stardate generation, sequencing, and counter advancement
- History entry creation, deduplication, and 20/30-entry limits
- Markdown generation output format
- Backup export structure
- Backup import and restoration
- Encrypted backup round-trip (encrypt → decrypt → verify)
- Confirmation modal flow
- Voice capture state transitions
- Storage error handling
- Status message display and clearing

**Runs:** Always, as part of `npm test`.

---

## Playwright E2E Tests

**File:** `tests/usstjr.spec.js`

End-to-end tests that drive a real Chromium browser against a local static server. These verify that the full user workflow works — from form fill through to save, display, export, and restore.

**Configuration:** `playwright.config.js`
- Browser: Chromium only
- Base URL: `http://127.0.0.1:4173`
- Web server: `scripts/static-server.js` (started automatically, reused if already running)
- Screenshots: On failure only
- Trace: On first retry

**Test coverage:**

| Area | Scenarios tested |
|------|-----------------|
| Command Deck | Loads correctly; headings, controls, and dashboard visible |
| Captain's Log | Fill form; generate markdown; save; display in history |
| Medical Bay | Fill form; generate health summary; save; display in history |
| Markdown output | Format, headings, and metric values in generated text |
| Status messages | Info, success, and error states display correctly |
| Confirmation modal | Shows on destructive action; confirm and cancel both work |
| Backup (JSON) | Export creates download; import restores data |
| Encrypted backup | Export with passphrase; import with same passphrase restores data |
| Log history | Entries appear after save; search filters results |
| Reset | Clear buttons trigger confirmation; reset empties form |
| Draft auto-save | Form state survives page reload |
| Stardate | Generated on page load; increments for multiple saves on same day |
| Voice capture | Buttons enabled/disabled correctly based on browser support |
| Page errors | All tests assert zero JavaScript console errors |

**Runs:** As part of `npm test`; also in `static-checks.yml` and `production-deploy.yml`.

---

## Production Smoke Tests

**File:** `tests/production-smoke.spec.js`

**Configuration:** `playwright.production.config.js`

Lightweight tests that run against the live deployed site. They verify the deployment succeeded and the application is functional in production, not just locally.

**Requires:** `PRODUCTION_BASE_URL` environment variable set to the live site URL.

**Checks:**
- All three pages load (`/`, `/captains-log.html`, `/medical-bay.html`)
- Main page heading is visible on each page
- Backup button visible on Command Deck
- Save button visible on Captain's Log and Medical Bay
- Confirmation modal is hidden on initial load
- No JavaScript runtime errors on page load
- `version.json` is accessible and contains a `gitCommitSha` field

**Runs:** After every production deployment in `production-deploy.yml`.

---

## Running Tests

### Full suite (recommended before any commit)

```bash
npm test
```

Runs static checks, behaviour checks, and all Playwright E2E tests.

### Static and behaviour checks only (no Playwright required)

```bash
node scripts/run-checks.js
```

Useful when Playwright is not installed or during quick iteration.

### E2E tests only

```bash
npm run test:e2e
```

### Production smoke tests

```bash
PRODUCTION_BASE_URL=https://your-site.github.io npm run test:prod
```

---

## First-Time Setup

Playwright must be installed before running E2E tests:

```bash
npm install
npx playwright install chromium
```

The static server (`scripts/static-server.js`) is started automatically by Playwright when tests run. You do not need to start it manually.

---

## CI Integration

Both GitHub Actions workflows run the full test suite automatically:

- **`static-checks.yml`** — Runs on every pull request and push to `main`. Blocks merges on failure.
- **`production-deploy.yml`** — Runs validation before deploying, then runs production smoke tests after deployment.

See [deployment.md](deployment.md) for the full CI pipeline.

---

## Troubleshooting

### `Cannot find module` error in static checks

A required file is missing from the repository. Check the list of required files in `scripts/static-check.js` and ensure all are committed.

### Playwright fails to start the server

Ensure nothing is already listening on port 4173. Kill any stale processes:
```bash
lsof -ti:4173 | xargs kill -9
```

### Encrypted backup test fails in CI

The encrypted backup tests require `SubtleCrypto` (Web Crypto API). This is available in Chromium. If the test fails with a crypto error, verify the Playwright browser version is current.

### Behaviour check fails with `storageGetItem is not a function`

The behaviour check injects a mock DOM. If a module imports a function that is not mocked, the check will fail. Add the missing function to the mock setup in `behavior-check.js`.

### All tests pass locally but fail in CI

Check that all changed files are committed and pushed. The CI environment clones from the remote; uncommitted local changes are invisible to it.

### A test assertion about the stardate is wrong

Stardates are date-based. If a test creates a log and then checks for a specific stardate format, ensure the test's date expectations account for the `YYMMDD.N` format, not an absolute value.
