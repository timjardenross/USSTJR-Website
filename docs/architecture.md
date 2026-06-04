# USS TJR — Architecture

## Purpose

USS TJR is a personal resilience operating system. It provides daily logging, health tracking, and wellness management in a static browser application. All data stays on the user's device; no server, no account, no third-party dependency is required.

## Design Principles

| Principle | What it means |
|-----------|--------------|
| **Local First** | Data is stored in browser localStorage. Nothing leaves the device without an explicit export action. |
| **GitHub Pages Hosted** | The site is deployed as a static artefact. No backend, no database, no server-side processing. |
| **Static Architecture** | Plain HTML, CSS, and JavaScript ES6 modules. No build step, no bundler, no framework. |
| **Minimal Dependencies** | Zero production npm packages. Dev dependencies are limited to `@playwright/test`. |
| **Privacy Focused** | No analytics, no telemetry, no external requests. Encrypted backup uses the browser's native Web Crypto API. |
| **Accessible** | Skip links, ARIA live regions, focus management, semantic headings, and keyboard support throughout. |

## System Components

| Component | Status | Description |
|-----------|--------|-------------|
| **Command Deck** | Live | Dashboard. Displays latest metrics, recent logs, mission status, and backup controls. |
| **Captain's Log** | Live | Daily log form. Records mood, energy, pain, stress, reflections, and priorities. |
| **Medical Bay** | Live (Phase 1) | Health tracking. Records pain, sleep, CPAP compliance, mood, anxiety, energy, and daily observations. |
| **Backup & Restore** | Live | Export/import plain JSON or AES-GCM encrypted backups. |
| **Voice Capture** | Live | Web Speech API integration in Captain's Log for dictated entries. |
| **Intelligence Layer** | Future | Pattern analysis across logs. Planned as Medical Bay Phase 8. |
| **Document Vault** | Future | Medical document storage. Planned as Medical Bay Phase 5. |
| **Computer Core** | Future | Central settings and data hub. |

## Repository Structure

```
USSTJR-Website/
├── index.html                  # Command Deck
├── captains-log.html           # Captain's Log
├── medical-bay.html            # Medical Bay
├── css/
│   └── styles.css              # Global dark theme styles
├── js/
│   ├── app.js                  # Backwards-compatibility shim (imports main.js)
│   ├── main.js                 # App initialisation — wires all modules together
│   ├── core/                   # Shared utilities (no business logic)
│   │   ├── constants.js        # Storage keys, history limits, field definitions
│   │   ├── dates.js            # Stardate generation and date formatting
│   │   ├── dom.js              # DOM helpers (bind, get, set, download)
│   │   ├── status.js           # In-page status message display
│   │   └── storage.js          # localStorage wrapper with error handling
│   └── modules/                # Feature modules (one per major feature area)
│       ├── backup.js           # Export, import, encrypt, decrypt backups
│       ├── captains-log.js     # Daily log workflow
│       ├── command-deck.js     # Dashboard display and history management
│       ├── confirm-modal.js    # Custom confirmation dialogs
│       ├── medical-bay.js      # Health tracking workflow
│       └── voice-capture.js    # Web Speech API integration
├── docs/                       # Documentation
│   ├── architecture.md         # This file
│   ├── data-model.md
│   ├── deployment.md
│   ├── features/
│   │   ├── command-deck.md
│   │   ├── captains-log.md
│   │   ├── medical-bay.md
│   │   └── backup-restore.md
│   ├── roadmap.md
│   ├── runbook.md
│   └── testing.md
├── scripts/                    # Node.js tooling (not shipped to browser)
│   ├── run-checks.js           # Master test runner
│   ├── static-check.js         # File existence and structure validation
│   ├── behavior-check.js       # Business logic simulation in Node
│   ├── prepare-pages-artifact.js # Builds _site/ for GitHub Pages
│   └── static-server.js        # Local HTTP server for Playwright
├── tests/
│   ├── usstjr.spec.js          # Full Playwright E2E suite
│   └── production-smoke.spec.js # Smoke tests against live deployment
├── .github/
│   ├── copilot-instructions.md # Engineering standards for AI assistants
│   └── workflows/
│       ├── static-checks.yml   # Runs on every PR and push to main
│       └── production-deploy.yml # Validates, deploys, then smoke-tests
├── BACKLOG.md                  # Feature backlog and completed items
├── MEDICAL_BAY_SCOPE.md        # Medical Bay 10-level vision document
├── package.json
├── playwright.config.js
└── playwright.production.config.js
```

## High-Level Architecture

### Page Model

Each HTML page is a self-contained document. All three pages share one CSS file and one JavaScript entry point (`main.js`). The entry point detects which page is active and initialises only the relevant modules.

```
Browser
  └── index.html / captains-log.html / medical-bay.html
        ├── css/styles.css
        └── js/main.js  (type="module")
              ├── js/core/*        (shared utilities)
              └── js/modules/*     (feature logic)
```

### Data Flow

```
User fills form
    │
    ▼
Draft auto-saved to localStorage (debounced on input events)
    │
    ▼
User clicks Save
    │
    ▼
Module validates and builds data object
    │
    ├── Writes to history array in localStorage
    ├── Writes to "latest entry" key in localStorage
    └── Advances stardate counter in localStorage

User clicks Export Backup
    │
    ▼
backup.js reads all localStorage keys
    │
    ├── Plain JSON → downloaded as .json file
    └── Encrypted  → Web Crypto AES-GCM → downloaded as .enc.json file

User clicks Import Backup
    │
    ▼
backup.js validates structure
    │
    └── Restores all keys to localStorage
```

### Storage Model

All persistence is client-side localStorage. See [data-model.md](data-model.md) for the full schema.

```
localStorage
  ├── usstjr-captains-log-draft        Object   Current form draft
  ├── usstjr-latest-captains-log       Object   Most recent saved log
  ├── usstjr-captains-log-history      Array    Up to 20 logs, sorted by date
  ├── usstjr-medical-bay-draft         Object   Medical Bay form draft
  ├── usstjr-medical-bay-history       Array    Up to 30 health logs
  └── usstjr-stardate-YYMMDD           Number   Daily sequence counter per date
```

### Module Dependency Map

```
main.js
  ├── core/constants.js      (no deps)
  ├── core/dates.js          (constants)
  ├── core/dom.js            (no deps)
  ├── core/status.js         (no deps)
  ├── core/storage.js        (status)
  ├── modules/confirm-modal.js  (no deps)
  ├── modules/command-deck.js   (constants, dates, dom, status, storage)
  ├── modules/captains-log.js   (constants, dates, dom, status, storage, command-deck)
  ├── modules/medical-bay.js    (constants, dates, dom, status, storage)
  ├── modules/backup.js         (constants, dom, status, storage)
  └── modules/voice-capture.js  (dom, status)
```

No circular dependencies exist. Core modules have no dependencies on feature modules.

### CI/CD Pipeline

```
Code change pushed / PR opened
    │
    ▼
static-checks.yml
    ├── node scripts/run-checks.js   (syntax, static, behavior)
    └── playwright test              (E2E on Chromium)
    │
    ▼  (main branch only)
production-deploy.yml
    ├── Validation (same checks)
    ├── Deploy to GitHub Pages
    └── production-smoke.spec.js against live URL
```

See [deployment.md](deployment.md) for the full deployment workflow.
