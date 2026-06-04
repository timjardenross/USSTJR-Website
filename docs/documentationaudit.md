# USS TJR — Documentation Audit

**Date:** 2026-06-04
**Auditor:** Documentation Architect

---

## Executive Summary

USS TJR has completed six major milestones (Foundation Stabilisation, JavaScript Modularisation, Playwright Testing, Stardate Automation, Deployment Automation, Data Resilience) and is entering Medical Bay Phase 2. The codebase is well-organised and the test suite is comprehensive.

**Documentation maturity before this audit: 5/10**

The primary gap was structural: there was no `docs/` organisation, no architecture document, no data model, no feature guides, and no operational runbook. The README and deployment guide were accurate but insufficient for onboarding a new contributor or briefing a future AI agent.

**Documentation maturity after this audit: 8/10**

---

## Gap Analysis

### Missing Documents (created in this audit)

| Document | Risk if missing |
|----------|----------------|
| `docs/architecture.md` | Future contributors cannot understand how pages, modules, and CI connect without reading all source files |
| `docs/data-model.md` | Medical Bay Phase 2 data changes made without understanding existing schemas, causing storage conflicts |
| `docs/testing.md` | New contributors run the wrong test command; CI failures misdiagnosed |
| `docs/roadmap.md` | Future milestones undocumented; backlog context lost when BACKLOG.md is cleaned up |
| `docs/runbook.md` | Routine operations (backup, rollback, new page) require tribal knowledge |
| `docs/features/command-deck.md` | Feature scope and dependencies invisible to future developers |
| `docs/features/captains-log.md` | Same — especially important as voice capture and stardate logic are non-obvious |
| `docs/features/medical-bay.md` | Critical for Medical Bay Phase 2: 21KB module with complex CPAP tracking and phase roadmap |
| `docs/features/backup-restore.md` | Encryption details undocumented; security properties invisible |

### Outdated Documentation

| Document | Issue |
|----------|-------|
| `README.md` | Repository tree is outdated (missing `production-deploy.yml`, `playwright.production.config.js`, `docs/` directory, several scripts). Development Notes section is written for a project still in prototype phase; the project has matured beyond that. |

### Duplicate Documentation

No significant duplication found. BACKLOG.md and MEDICAL_BAY_SCOPE.md serve different purposes and do not conflict.

### Inconsistent Terminology

| Inconsistency | Recommendation |
|--------------|----------------|
| README uses "Medical Bay MVP" | Retire the "MVP" qualifier. The feature is live and growing. Use "Medical Bay" or "Medical Bay Phase 1". |
| README uses `YYMMDD.NN` for stardate format | The code uses `.N` (single digit sequence). Standardise on `YYMMDD.N` in all documentation. |
| `static-checks.yml` workflow is named "USS TJR Validation" in deployment.md but the file name suggests "Static Checks" | Minor; clarify both workflow names in deployment.md if desired. |

### Undocumented Features

| Feature | Gap |
|---------|-----|
| Voice capture `en-AU` locale | Not mentioned anywhere outside the source code |
| PBKDF2 iteration count and AES-GCM key size | Encryption algorithm documented at high level in README; specific parameters undocumented |
| Stardate counter storage key format | `usstjr-stardate-YYMMDD` pattern not documented in README |
| Log history entry ID format | `YYYYMMDD-STARDATE` not documented |
| `.nojekyll` file purpose | Present in artifact but not explained in deployment docs |
| `version.json` fields | Listed in deployment.md but not tied to the smoke test that reads them |

---

## Proposed Documentation Structure

```
docs/
├── architecture.md          ✓ Created — system design, module map, CI pipeline
├── data-model.md            ✓ Created — all storage keys, schemas, backup format
├── deployment.md            ✓ Exists — updated to reference new docs
├── documentation-audit.md  ✓ This document
├── roadmap.md               ✓ Created — completed and planned milestones
├── runbook.md               ✓ Created — operational procedures
├── testing.md               ✓ Created — all test layers with troubleshooting
└── features/
    ├── backup-restore.md    ✓ Created — backup workflows and encryption details
    ├── captains-log.md      ✓ Created — daily log feature
    ├── command-deck.md      ✓ Created — dashboard feature
    └── medical-bay.md       ✓ Created — health tracking feature

Root documents:
├── README.md                ✓ Updated — reflects current capabilities
├── BACKLOG.md               ✓ Exists — no changes needed
└── MEDICAL_BAY_SCOPE.md     ✓ Exists — no changes needed
```

---

## Priority Order

### Must Have

These documents are required for safe ongoing development and for any future AI agent or contributor to work without causing regressions.

| Document | Reason |
|----------|--------|
| `docs/architecture.md` | Describes the module dependency map and CI pipeline |
| `docs/data-model.md` | Critical for Medical Bay Phase 2; prevents schema collisions |
| `docs/features/medical-bay.md` | Medical Bay Phase 2 is the current milestone |
| `docs/testing.md` | Prevents incorrect test usage and CI misdiagnosis |
| `docs/runbook.md` | Enables maintenance without tribal knowledge |
| README.md update | Entry point for all contributors and AI agents |

### Should Have

| Document | Reason |
|----------|--------|
| `docs/features/captains-log.md` | Complex feature with voice capture and stardate automation |
| `docs/features/backup-restore.md` | Encryption properties should be documented |
| `docs/roadmap.md` | Context for prioritisation decisions |

### Nice To Have

| Document | Reason |
|----------|--------|
| `docs/features/command-deck.md` | Dashboard is simpler; less critical than other features |
| CHANGELOG.md | Useful but covered by BACKLOG.md for now |
| CONTRIBUTING.md | Useful but `.github/copilot-instructions.md` covers this for AI contributors |

---

## Recommendations

### 1. Update README.md

The repository tree in README.md is missing several files and directories added since it was written (`production-deploy.yml`, `playwright.production.config.js`, `docs/`, `prepare-pages-artifact.js`, `production-smoke.spec.js`). The Development Notes section should be revised to reflect that USS TJR is no longer a "compact static prototype" but a mature, tested application.

**Action:** Update the repository tree and revise Development Notes.

### 2. Adopt consistent terminology

Always use: **Command Deck**, **Captain's Log**, **Medical Bay**, **Backup & Restore**. Avoid "MVP", "dashboard", "daily log form" as alternate names.

### 3. Link documents together

Each feature document should link to the data model for its storage schema. The architecture document should link to all feature documents. The runbook should link to all operational guides. This is now done in the documents created by this audit.

### 4. Update docs when Medical Bay Phase 2 ships

When Phase 2 adds new data fields, update `docs/data-model.md` and `docs/features/medical-bay.md` as part of the feature's definition of done.

### 5. Keep BACKLOG.md as the living task list

`docs/roadmap.md` provides strategic milestone context. BACKLOG.md provides the tactical task list. Keep both, but do not duplicate items between them. Roadmap describes what phase something belongs to; backlog describes the specific tasks.

### 6. Add docs to static-check.js required files

Add all new `docs/` files to the required-files list in `scripts/static-check.js` to prevent accidental deletion.
