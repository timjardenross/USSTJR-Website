# USSTJR Website

USS TJR is a static personal resilience operating system website. The current app provides a Command Deck dashboard and a Captain's Log workflow for daily check-ins, markdown generation, voice transcript capture, and local draft storage.

## Current Structure

```text
USSTJR-Website/
├── index.html
├── captains-log.html
├── css/
│   └── styles.css
└── js/
    └── app.js
```

## Pages

- `index.html` is the Command Deck. It shows mission status, current modules, current focus areas, and the latest saved Captain's Log status metrics.
- `captains-log.html` is the daily log form. It captures status metrics, written reflections, voice transcript text, tomorrow's priorities, and generated markdown.

## Local Usage

No build step or dependency install is required.

1. Open `index.html` in a browser.
2. Use **Start New Log** to open the Captain's Log page.
3. Fill in the daily check-in fields.
4. Select **Generate Markdown** to create the log output.
5. Select **Copy Markdown** or **Download + Reset Form** to keep a copy.

For best voice capture support, use a browser that implements the Web Speech API, such as Chrome. Browser support varies, and microphone permissions may be required.

## Data Storage Model

The app currently stores data in browser `localStorage`:

- Draft Captain's Log data is stored under `usstjr-captains-log-draft`.
- Latest Command Deck status data is stored under `usstjr-latest-captains-log`.
- Captain's Log history is stored under `usstjr-captains-log-history`.
- Daily stardate counters are stored under keys beginning with `usstjr-stardate-`.

This means data is local to the current browser profile and device. It is not synced, backed up, encrypted, or stored on a server. Use the markdown download workflow to keep durable copies of important logs.

## Deployment

This repository can be hosted as a static site. Any static host that serves `index.html`, `captains-log.html`, `css/styles.css`, and `js/app.js` should work.

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

## Known Follow-Up Work

- Add local-date-safe stardate defaults.
- Add 0-10 metric validation before generating logs.
- Add import and export backup support.
- Move inline HTML event handlers into JavaScript event listeners.
- Add accessibility and mobile layout checks.
