# USSTJR Website Backlog

## Recently Completed

- Harden local storage access with safe wrappers and in-page status messages.
- Add Captain's Log history storage, recent log rendering, download, delete, and clear controls.
- Add JSON backup export/import for local USS TJR data.
- Add encrypted backup export/import with a browser-side passphrase workflow.
- Replace native destructive-action confirmations with custom confirmation dialogs.
- Add recent log search across stardate, date, metrics, and log markdown.
- Add static and behavior checks for core workflows.
- Add a single local/CI check runner with `node scripts/run-checks.js`.
- Add `.gitignore` and remove tracked `.DS_Store`.
- Update README with current structure, usage, validation, and deployment notes.
- Test Command Deck sync from Captain's Log save, restore, delete, and clear workflows.
- Test Download + Reset workflows for generated markdown, saved logs, backups, and draft clearing.
- Test Voice Capture support, unavailable states, transcript capture, stop handling, and permission errors.
- Build Medical Bay Phase 1 for daily pain, mood, sleep, energy, notes, history, markdown summaries, and backup support.

## Next Backlog Items

1. Add full browser automation coverage with a test runner such as Playwright.
2. Split `js/app.js` into smaller modules once the app needs a build step or more pages.
3. Choose a cloud sync provider, backend, and authentication model.
4. Implement multi-device sync after the provider/backend decision is made.
5. Build Medical Bay Phase 2 for medications, blood pressure, weight, and CPAP tracking.
6. Build Medical Bay Phase 3 for medical history, specialists, and procedure tracking.
7. Build Medical Bay Phase 4 for document vault upload, storage, search, and retrieval.
8. Build Medical Bay Phase 5 analytics for trends, correlations, and visualisations.
9. Add Weekly Intelligence Summary from saved Captain's Logs, Medical Bay logs, and Command Deck status.
10. Build Computer Core as the central data, settings, and system-control surface.
11. Add encrypted backup behavior tests for Web Crypto-capable browser environments.
12. Add import/export regression tests around invalid encrypted files and wrong passphrases.
13. Add richer recent-log filters, such as date range, metric thresholds, and tags.
14. Add a guided restore preview before replacing local browser data.
15. Add a storage usage indicator and warning when browser storage is close to quota.
16. Add a lightweight release checklist for static deployment.

## Parking Lot

- Consider a small design-system pass if more pages are added.
- Consider markdown preview rendering once generated logs become more complex.
- Consider a privacy/security note page if the site is shared publicly.
