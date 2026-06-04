# USS TJR — Operational Runbook

This runbook documents how to operate, maintain, and recover USS TJR. It is written so that any contributor — or a future AI assistant — can perform all routine operations without prior context.

---

## Daily Operations

USS TJR is a static site with no server to maintain. There are no scheduled jobs, no database backups to run, and no services to restart. Normal daily operation is:

1. The site is live at its GitHub Pages URL.
2. Any push to `main` triggers a new deployment automatically.
3. No manual intervention is required unless a workflow fails.

---

## Development Workflow

### Starting a new feature

1. Create a branch from `main`:
   ```bash
   git checkout main && git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. Make changes. Run checks before committing:
   ```bash
   npm test
   ```

3. Push the branch and open a pull request. The `static-checks.yml` workflow runs automatically.

4. Once the PR is approved and all checks pass, merge to `main`. Deployment runs automatically.

### Engineering standards

See `.github/copilot-instructions.md` for the full rule set. Key points:
- No frameworks without explicit request
- No changes to existing functionality unless the task requires it
- Small, reviewable changes
- Check navigation, links, console, and mobile before marking complete

---

## Testing Process

### Before any merge

```bash
npm install            # only needed once or after package.json changes
npm test               # full suite: static, behaviour, E2E
```

### Quick checks (no Playwright needed)

```bash
node scripts/run-checks.js
```

### After a production deployment

```bash
PRODUCTION_BASE_URL=https://your-site.github.io npm run test:prod
```

See [testing.md](testing.md) for full test documentation.

---

## Deployment Process

Deployment is fully automated. The manual steps are:

1. Merge a pull request to `main` (or push directly to `main`).
2. The `production-deploy.yml` workflow starts automatically.
3. Monitor the Actions tab in GitHub for progress.
4. Once the workflow completes, verify the live site:
   - All three pages load (`/`, `/captains-log.html`, `/medical-bay.html`)
   - `version.json` is accessible and contains the expected `gitCommitSha`
   - No JavaScript errors in the browser console

See [deployment.md](deployment.md) for the full deployment pipeline.

---

## Backup Process (User)

USS TJR data lives only in the browser where it was created. Users should export backups regularly.

### Export a plain backup

1. Go to the Command Deck.
2. Click **Export Backup**.
3. Save the `.json` file to a safe location (cloud storage, external drive).

### Export an encrypted backup

1. Go to the Command Deck.
2. Click **Export Encrypted Backup**.
3. Enter a passphrase when prompted.
4. Save the `.enc.json` file. **The passphrase is not stored. If lost, the backup cannot be recovered.**

**Recommended schedule:** Export after every session, or at minimum weekly. Store at least one copy offsite.

---

## Restore Process (User)

### Restore from a plain backup

1. Go to the Command Deck.
2. Click **Import Backup**.
3. Select the `.json` file.
4. Confirm the import. **All current data is replaced.**

### Restore from an encrypted backup

1. Go to the Command Deck.
2. Click **Import Encrypted Backup**.
3. Select the `.enc.json` file.
4. Enter the passphrase used when the backup was created.
5. Confirm the import.

### After restoring

- Verify the Captain's Log history shows expected entries.
- Verify Medical Bay history shows expected entries.
- Check that the Command Deck metrics display correctly.

---

## Rollback Process

If a deployment produces a broken site:

### Option 1: Revert the commit (preferred)

```bash
git revert <commit-sha>
git push origin main
```

The revert commit triggers a new deployment. The previous known-good version is restored.

### Option 2: Manual redeploy via GitHub Actions

1. Go to the Actions tab in GitHub.
2. Select the `Production Deploy` workflow.
3. Click **Run workflow** and choose the last known-good commit SHA.

### Verify after rollback

Run production smoke tests to confirm:
```bash
PRODUCTION_BASE_URL=https://your-site.github.io npm run test:prod
```

---

## Issue Management

### Reporting a bug

1. Check [BACKLOG.md](../BACKLOG.md) to see if the issue is already known.
2. Open a GitHub Issue with:
   - Page affected (Command Deck / Captain's Log / Medical Bay)
   - Steps to reproduce
   - Expected behaviour
   - Actual behaviour
   - Browser and OS

### Prioritising backlog items

BACKLOG.md uses three levels:

| Level | Meaning |
|-------|---------|
| **Must Have** | Required for the current milestone. Blocks merging the milestone. |
| **Should Have** | High value. Complete within the current milestone if possible. |
| **Nice To Have** | Low urgency. Defer to a future milestone or parking lot. |

### Closing a backlog item

Move the item to the **Recently Completed** section in BACKLOG.md when the feature is merged and deployed.

---

## Storage Maintenance

### Clearing all data (user action)

Use the browser's DevTools Application tab to clear localStorage for the site, or use the **Clear History** button in the application.

**Warning:** This cannot be undone. Export a backup first.

### Checking storage usage

In browser DevTools (Application → Local Storage), inspect all keys prefixed `usstjr-`. The total size is typically under 1 MB for a year of daily use.

### Schema migration

If a future change requires updating the stored data format:

1. Increment the backup `version` field in `js/core/constants.js`.
2. Write a migration function in the affected module that detects old schema entries on load and upgrades them.
3. Test migration with both old and new data in `scripts/behavior-check.js`.
4. Document the schema change in [data-model.md](data-model.md).

---

## Adding a New Page

If a new HTML page is added to the application:

1. Create the HTML file in the root directory.
2. Add it to the required-files list in `scripts/static-check.js`.
3. Add it to the copy list in `scripts/prepare-pages-artifact.js`.
4. Add E2E tests in `tests/usstjr.spec.js` (at minimum: page loads, heading visible, no console errors).
5. Add a smoke test assertion in `tests/production-smoke.spec.js`.
6. Update [architecture.md](architecture.md) and the relevant feature doc in `docs/features/`.

---

## Adding a New JavaScript Module

1. Create the file under `js/modules/` or `js/core/`.
2. Add it to the required-files list in `scripts/static-check.js`.
3. Import and initialise it in `js/main.js`.
4. Add mock support to `scripts/behavior-check.js` if the module uses DOM or storage.
5. Write behaviour-check tests for the module's core logic.
6. Write Playwright tests for any user-facing functionality.

---

## Contacts and References

| Resource | Location |
|----------|----------|
| Engineering standards | `.github/copilot-instructions.md` |
| Feature backlog | `BACKLOG.md` |
| Medical Bay vision | `MEDICAL_BAY_SCOPE.md` |
| Architecture | `docs/architecture.md` |
| Data model | `docs/data-model.md` |
| Testing guide | `docs/testing.md` |
| Deployment guide | `docs/deployment.md` |
| Roadmap | `docs/roadmap.md` |
| Feature docs | `docs/features/` |
