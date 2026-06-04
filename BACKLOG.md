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
- Split `js/app.js` into native ES modules with `js/main.js` as the browser entry point.
- Add Playwright E2E coverage for Command Deck, Captain's Log, Medical Bay, backup/restore, confirmation modal, and ES module browser loading.
- Add Captain's Log stardate auto-calculation with date-based sequencing, draft preservation, history preservation, and reset regeneration.
- Add one-click Captain's Log save that generates markdown, saves history, syncs Command Deck metrics, and preserves stardate sequencing.
- Add CPAP compliance monitoring for myAir score, usage, mask seal, AHI, mask-off count, trends, status, compliance, and backup support.
- Add weekly weight tracking for current weight, weekly change, trend direction, highest/lowest records, rolling trends, and backup support.

## Next Backlog Items

1. Choose a cloud sync provider, backend, and authentication model.
2. Implement multi-device sync after the provider/backend decision is made.
3. Build Medical Bay Phase 2 for medications, blood pressure, weight, and CPAP tracking.
4. Build Medical Bay Phase 3 for medical history, specialists, and procedure tracking.
5. Build Medical Bay Phase 4 for document vault upload, storage, search, and retrieval.
6. Build Medical Bay Phase 5 analytics for trends, correlations, and visualisations.
7. Add Weekly Intelligence Summary from saved Captain's Logs, Medical Bay logs, and Command Deck status.
8. Build Computer Core as the central data, settings, and system-control surface.
9. Add encrypted backup behavior tests for Web Crypto-capable browser environments.
10. Add import/export regression tests around invalid encrypted files and wrong passphrases.
11. Add richer recent-log filters, such as date range, metric thresholds, and tags.
12. Add a guided restore preview before replacing local browser data.
13. Add a storage usage indicator and warning when browser storage is close to quota.
14. Add a lightweight release checklist for static deployment.

## Parking Lot

- Consider a small design-system pass if more pages are added.
- Consider markdown preview rendering once generated logs become more complex.
- Consider a privacy/security note page if the site is shared publicly.
