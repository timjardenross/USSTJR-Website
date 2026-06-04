# USSTJR Website

USS TJR is a static personal resilience operating system website. The current app provides a Command Deck dashboard, a Captain's Log workflow, and a Medical Bay MVP for daily health tracking.

## Current Structure

```text
USSTJR-Website/
├── .github/
│   └── workflows/
│       └── static-checks.yml
├── scripts/
│   ├── behavior-check.js
│   ├── run-checks.js
│   ├── static-server.js
│   └── static-check.js
├── tests/
│   └── usstjr.spec.js
├── .gitignore
├── BACKLOG.md
├── MEDICAL_BAY_SCOPE.md
├── package.json
├── playwright.config.js
├── index.html
├── captains-log.html
├── medical-bay.html
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── main.js
    ├── core/
    │   ├── constants.js
    │   ├── dates.js
    │   ├── dom.js
    │   ├── status.js
    │   └── storage.js
    └── modules/
        ├── backup.js
        ├── captains-log.js
        ├── command-deck.js
        ├── confirm-modal.js
        ├── medical-bay.js
        └── voice-capture.js
```

## Pages

- `index.html` is the Command Deck. It shows mission status, current modules, current focus areas, and the latest saved Captain's Log status metrics.
- `captains-log.html` is the daily log form. It captures status metrics, written reflections, voice transcript text, tomorrow's priorities, and generated markdown.
- `medical-bay.html` is the Medical Bay MVP. It captures pain, mood, sleep, energy, and daily health notes, then generates a health intelligence markdown summary.

The browser entry point is `js/main.js`, loaded with native ES modules. `js/app.js` is kept only as a compatibility shim.

## Local Usage

No build step or dependency install is required.

1. Open `index.html` in a browser.
2. Use **Start New Log** to open the Captain's Log page.
3. Fill in the daily check-in fields.
4. Select **Save Captain's Log** to generate markdown, save the log to local history, and update the Command Deck.
5. Select **Preview Markdown** when you want to review the markdown before saving.
6. Select **Copy Markdown** or **Download Markdown** to keep a markdown copy.
7. Use **Export Backup** on the Command Deck to download all local USS TJR data as JSON.
8. Use a backup passphrase with **Export Encrypted** and **Import Encrypted** when you want a protected local backup file.
9. Search recent logs by stardate, date, metrics, or log text.
10. Use **Download** or **Delete** on individual recent logs, or **Clear History** to remove local log history.
11. Use **Open Medical Bay** to save daily health logs and download health intelligence summaries.

For best voice capture support, use a browser that implements the Web Speech API, such as Chrome. Browser support varies, and microphone permissions may be required. When voice capture is unavailable, the transcript field remains available for manual entry.

Captain's Log stardates are generated automatically in `YYMMDD.NN` format. Changing the log date recalculates the stardate for that date, and multiple logs on the same date increment the sequence number.

## Data Storage Model

The app currently stores data in browser `localStorage`:

- Draft Captain's Log data is stored under `usstjr-captains-log-draft`.
- Latest Command Deck status data is stored under `usstjr-latest-captains-log`.
- Captain's Log history is stored under `usstjr-captains-log-history`.
- Medical Bay draft data is stored under `usstjr-medical-bay-draft`.
- Medical Bay health log history is stored under `usstjr-medical-bay-history`.
- Daily stardate counters are stored under keys beginning with `usstjr-stardate-`.

This means data is local to the current browser profile and device. It is not synced or stored on a server. Use the markdown download, JSON backup, and encrypted backup workflows to keep durable copies of important logs.

Status and error messages are shown in-page where possible. Destructive actions such as clearing drafts, clearing history, deleting a log, and importing a backup use custom confirmation dialogs.

Encrypted backups are protected with a passphrase in the browser using Web Crypto APIs. Store the passphrase separately; the app cannot recover it if it is lost.

## Validation

Run the dependency-free static and behavior check suite with:

```sh
node scripts/run-checks.js
```

Run browser E2E coverage after installing dev dependencies:

```sh
npm install
npx playwright install chromium
npm run test:e2e
```

GitHub Actions installs Playwright Chromium and runs `npm test` on pushes to `main` and on pull requests.

## Deployment

This repository can be hosted as a static site. Any static host that serves `index.html`, `captains-log.html`, `medical-bay.html`, `css/styles.css`, and `js/app.js` should work.

Suitable deployment targets include:

- GitHub Pages
- Netlify
- Vercel static hosting
- Cloudflare Pages

The expected production entry point is `index.html`.

## Browser Support

Core app behavior should work in modern desktop and mobile browsers with JavaScript enabled. Voice capture depends on the Web Speech API and is not guaranteed across all browsers.

## Development Notes

- Keep the site usable without a build step until there is a clear reason to introduce one.
- Treat `localStorage` as temporary convenience storage, not durable archival storage.
- Prefer small, focused changes while the app is still a compact static prototype.
- If the app grows beyond a few pages or needs tests, introduce a minimal toolchain deliberately.
- Keep behavior coverage focused on critical workflows before large refactors.

## Known Follow-Up Work

See `BACKLOG.md` for the current completed-work list, next backlog items, and parking lot.

- Choose a sync provider or backend before adding true multi-device cloud sync.
