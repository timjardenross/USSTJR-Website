# USS TJR — Roadmap

This document tracks completed milestones, the current focus, and planned future work.

For detailed feature backlog items, see [BACKLOG.md](../BACKLOG.md).
For Medical Bay's expanded vision, see [MEDICAL_BAY_SCOPE.md](../MEDICAL_BAY_SCOPE.md).

---

## Completed Milestones

### Foundation Stabilisation
Established the core static architecture, module structure, and CI pipeline.

- Plain HTML/CSS/JavaScript ES6 module architecture
- `js/core/` utilities: constants, storage, dom, status, dates
- `js/modules/` feature modules: command-deck, captains-log, medical-bay, backup, voice-capture, confirm-modal
- `scripts/` tooling: static-check, behavior-check, static-server, prepare-pages-artifact
- GitHub Actions: static-checks.yml and production-deploy.yml
- `.github/copilot-instructions.md` engineering standards
- Initial README, BACKLOG, docs/deployment.md

### JavaScript Modularisation
Refactored from inline scripts to a clean ES6 module tree with no circular dependencies.

- Entry point: `js/main.js`
- Backwards-compatibility shim: `js/app.js`
- All feature logic isolated to named modules
- Shared utilities extracted to `js/core/`

### Playwright Testing
Full E2E test coverage across all three pages and all critical user workflows.

- `tests/usstjr.spec.js` — 20+ scenarios on Chromium
- `tests/production-smoke.spec.js` — live deployment verification
- `playwright.config.js` and `playwright.production.config.js`
- Integrated into both CI workflows

### Stardate Automation
Stardates are now generated automatically and advance without manual input.

- `js/core/dates.js` — full stardate generation and sequencing
- Daily sequence counter per date stored in localStorage
- Counter advances after each successful save
- Stardate recalculated when the user changes the log date

### Deployment Automation
Validated, automated delivery to GitHub Pages on every push to main.

- Production deploy workflow: validate → deploy → smoke test
- `scripts/prepare-pages-artifact.js` builds the `_site/` artefact
- `version.json` generated with build number, commit SHA, and timestamp
- `.nojekyll` prevents GitHub Jekyll processing

### Data Resilience
Users can export and restore their full data set, including encrypted backups.

- Plain JSON export and import
- AES-GCM encrypted backup with passphrase via Web Crypto API
- Full backup includes all logs, drafts, and stardate counters
- Import validates structure before restoring

---

## Current Milestone — Medical Bay Phase 2

Expanding Medical Bay from a daily log form into an active health intelligence platform.

Scope is defined in [MEDICAL_BAY_SCOPE.md](../MEDICAL_BAY_SCOPE.md).

**Phase 2 focus areas (from the scope document):**
- Level 2: Condition Management — track chronic conditions alongside daily metrics
- Enhanced CPAP compliance visualisation
- Trend summary: week-over-week metric averages
- Richer health intelligence markdown output

---

## Planned Milestones

### Intelligence Layer
Pattern analysis across Captain's Log and Medical Bay history.

- Weekly Intelligence Summary — automated pattern detection
- Metric trend graphs (pure browser canvas, no library)
- Configurable thresholds for alerts (e.g. pain > 7 for 3 days)
- Correlations: sleep vs energy, pain vs stress

### Computer Core
Central settings and data management hub.

- View and manage all localStorage keys
- Storage quota display and warning
- Global preferences (theme, date format, metric labels)
- Data migration tooling for future schema changes

### Document Vault (Medical Bay Phase 5)
Encrypted storage for medical documents.

- Upload and encrypt documents in-browser
- Categorised by type: results, referrals, prescriptions
- Export vault as encrypted archive
- No documents leave the device unencrypted

### Medication Centre (Medical Bay Phase 3)
Daily medication tracking and adherence.

- Medication list with dose and frequency
- Daily medication log linked to health metrics
- Missed dose tracking
- PRN (as-needed) medication logging

### Multi-Device Sync (Parking Lot)
Cloud synchronisation without a bespoke backend.

- Provider not yet chosen
- Candidates: iCloud, Google Drive, OneDrive, self-hosted
- Requires evaluation of privacy and dependency trade-offs
- Out of scope until a provider is selected

---

## Milestone Map

```
Foundation Stabilisation      ✓ Complete
JavaScript Modularisation     ✓ Complete
Playwright Testing            ✓ Complete
Stardate Automation           ✓ Complete
Deployment Automation         ✓ Complete
Data Resilience               ✓ Complete
                                    │
                                    ▼
Medical Bay Phase 2           ◉ In Progress
                                    │
                                    ▼
Intelligence Layer            ○ Planned
Computer Core                 ○ Planned
Medication Centre             ○ Planned
Document Vault                ○ Planned
Multi-Device Sync             ○ Parking Lot
```
