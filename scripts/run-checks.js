const { spawnSync } = require("child_process");

const jsFiles = [
    "js/app.js",
    "js/main.js",
    "js/core/constants.js",
    "js/core/storage.js",
    "js/core/dates.js",
    "js/core/status.js",
    "js/core/dom.js",
    "js/modules/command-deck.js",
    "js/modules/captains-log.js",
    "js/modules/medical-bay.js",
    "js/modules/backup.js",
    "js/modules/voice-capture.js",
    "js/modules/confirm-modal.js",
    "js/voice-system.js",
    "js/voice-indicator.js",
    "js/voice-commands.js",
    "playwright.config.js",
    "playwright.production.config.js",
    "scripts/prepare-pages-artifact.js",
    "scripts/static-server.js",
    "tests/production-smoke.spec.js",
    "tests/usstjr.spec.js"
];

const checks = jsFiles.map(function (filePath) {
    return ["node", ["--check", filePath]];
}).concat([
    ["node", ["scripts/static-check.js"]],
    ["node", ["scripts/behavior-check.js"]]
]);

checks.forEach(function ([command, args]) {
    const result = spawnSync(command, args, {
        encoding: "utf8",
        stdio: "inherit"
    });

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
});

console.log("All checks passed.");
