const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
    "index.html",
    "captains-log.html",
    "medical-bay.html",
    "css/styles.css",
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
    "js/modules/voice.js",
    "js/modules/confirm-modal.js",
    "js/voice-system.js",
    "js/voice-indicator.js",
    "package.json",
    "playwright.config.js",
    "playwright.production.config.js",
    "README.md",
    "BACKLOG.md",
    "MEDICAL_BAY_SCOPE.md",
    ".gitignore",
    ".github/workflows/static-checks.yml",
    ".github/workflows/production-deploy.yml",
    "docs/deployment.md",
    "scripts/run-checks.js",
    "scripts/behavior-check.js",
    "scripts/prepare-pages-artifact.js",
    "scripts/static-server.js",
    "tests/usstjr.spec.js",
    "tests/production-smoke.spec.js"
];

function readFile(filePath) {
    return fs.readFileSync(path.join(root, filePath), "utf8");
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

requiredFiles.forEach(function (filePath) {
    assert(fs.existsSync(path.join(root, filePath)), `Missing required file: ${filePath}`);
});

const indexHtml = readFile("index.html");
const captainsLogHtml = readFile("captains-log.html");
const medicalBayHtml = readFile("medical-bay.html");
const stylesCss = readFile("css/styles.css");
const appJs = readFile("js/app.js");
const mainJs = readFile("js/main.js");
const constantsJs = readFile("js/core/constants.js");
const storageJs = readFile("js/core/storage.js");
const datesJs = readFile("js/core/dates.js");
const statusJs = readFile("js/core/status.js");
const domJs = readFile("js/core/dom.js");
const commandDeckJs = readFile("js/modules/command-deck.js");
const captainsLogJs = readFile("js/modules/captains-log.js");
const medicalBayJs = readFile("js/modules/medical-bay.js");
const backupJs = readFile("js/modules/backup.js");
const voiceCaptureJs = readFile("js/modules/voice-capture.js");
const confirmModalJs = readFile("js/modules/confirm-modal.js");
const packageJson = JSON.parse(readFile("package.json"));
const playwrightConfigJs = readFile("playwright.config.js");
const productionPlaywrightConfigJs = readFile("playwright.production.config.js");
const e2eSpecJs = readFile("tests/usstjr.spec.js");
const productionSmokeSpecJs = readFile("tests/production-smoke.spec.js");
const validationWorkflowYml = readFile(".github/workflows/static-checks.yml");
const productionDeployWorkflowYml = readFile(".github/workflows/production-deploy.yml");
const deploymentDocs = readFile("docs/deployment.md");

[indexHtml, captainsLogHtml, medicalBayHtml].forEach(function (html) {
    assert(!/\son[a-z]+="/i.test(html), "Inline event handlers are not allowed.");
    assert(html.includes('href="#mainContent"'), "Missing skip link.");
    assert(html.includes('id="mainContent"'), "Missing main content landmark.");
    assert(html.includes('<script type="module" src="js/main.js"></script>'), "HTML must load js/main.js as a native module.");
    assert(!html.includes('<script src="js/app.js"></script>'), "HTML must not load legacy js/app.js directly.");
});

[
    "exportBackupButton",
    "exportEncryptedBackupButton",
    "clearHistoryButton",
    "appStatus",
    "importBackupInput",
    "importEncryptedBackupInput",
    "backupPassphraseInput",
    "historySearchInput",
    "recentLogsList",
    "confirmModal",
    "confirmModalMessage",
    "confirmModalConfirmButton",
    "confirmModalCancelButton"
].forEach(function (id) {
    assert(indexHtml.includes(`id="${id}"`), `Missing Command Deck element: ${id}`);
});

[
    "startVoiceCaptureButton",
    "stopVoiceCaptureButton",
    "voiceCaptureSupportMessage",
    "saveCaptainLogButton",
    "generateLogButton",
    "copyLogButton",
    "downloadLogButton",
    "resetFormButton",
    "confirmModal",
    "confirmModalMessage",
    "confirmModalConfirmButton",
    "confirmModalCancelButton"
].forEach(function (id) {
    assert(captainsLogHtml.includes(`id="${id}"`), `Missing Captain's Log control: ${id}`);
});

[
    "healthDateInput",
    "healthOverallPain",
    "healthBestPain",
    "healthWorstPain",
    "healthPainLocation",
    "healthMood",
    "healthAnxiety",
    "healthStress",
    "healthSleepHours",
    "healthSleepQuality",
    "healthWakeups",
    "healthEnergy",
    "healthFatigue",
    "healthObservations",
    "healthActivities",
    "healthTriggers",
    "healthWins",
    "healthChallenges",
    "cpapLatestScore",
    "cpapLatestUsage",
    "cpapLatestAhi",
    "cpapLatestStatus",
    "cpapAverageScore",
    "cpapAverageUsage",
    "cpapAverageAhi",
    "cpapCompliance",
    "cpapDateInput",
    "cpapScore",
    "cpapUsageTime",
    "cpapMaskSeal",
    "cpapEventsPerHour",
    "cpapMaskOffCount",
    "cpapNotes",
    "saveMedicalLogButton",
    "downloadMedicalLogButton",
    "resetMedicalLogButton",
    "medicalSummaryOutput",
    "medicalHistoryList"
].forEach(function (id) {
    assert(medicalBayHtml.includes(`id="${id}"`), `Missing Medical Bay control: ${id}`);
});

assert(appJs.trim() === 'import "./main.js";', "Legacy app.js should only be a compatibility shim.");
assert(!Object.prototype.hasOwnProperty.call(packageJson, "type"), "package.json must not force CommonJS scripts into ESM mode.");
assert(packageJson.scripts.check === "node scripts/run-checks.js", "Missing package check script.");
assert(packageJson.scripts["test:prod"] === "playwright test --config=playwright.production.config.js", "Missing production smoke test script.");
assert(packageJson.scripts["test:e2e"] === "playwright test", "Missing Playwright E2E script.");
assert(packageJson.devDependencies["@playwright/test"], "Missing @playwright/test dev dependency.");
assert(playwrightConfigJs.includes("scripts/static-server.js"), "Playwright config must use the static server.");
assert(playwrightConfigJs.includes("127.0.0.1:4173"), "Playwright config must target local static server.");
assert(playwrightConfigJs.includes('testMatch: "usstjr.spec.js"'), "Local Playwright config must exclude production smoke tests.");
assert(productionPlaywrightConfigJs.includes("PRODUCTION_BASE_URL"), "Production Playwright config must use production base URL.");
assert(e2eSpecJs.includes("Command Deck loads correctly"), "Missing Command Deck E2E test.");
assert(e2eSpecJs.includes("Captain's Log core workflow"), "Missing Captain's Log E2E test.");
assert(e2eSpecJs.includes("Medical Bay core workflow"), "Missing Medical Bay E2E test.");
assert(e2eSpecJs.includes("Backup export and import"), "Missing backup E2E test.");
assert(productionSmokeSpecJs.includes("production pages load without runtime errors"), "Missing production smoke test.");
assert(validationWorkflowYml.includes("name: USS TJR Validation"), "Validation workflow must have a clear USS TJR name.");
assert(productionDeployWorkflowYml.includes("name: USS TJR Production Deploy"), "Production deploy workflow must have a clear USS TJR name.");
assert(productionDeployWorkflowYml.includes("needs: validation"), "Deployment must depend on validation.");
assert(productionDeployWorkflowYml.includes("actions/deploy-pages"), "Production workflow must deploy through GitHub Pages.");
assert(productionDeployWorkflowYml.includes("npm run test:prod"), "Production workflow must run production smoke tests.");
assert(deploymentDocs.includes("Rollback"), "Deployment docs must include rollback instructions.");

[
    [mainJs, "initialiseApp"],
    [mainJs, "setupActionHandlers"],
    [constantsJs, "CAPTAINS_LOG_DRAFT_KEY"],
    [storageJs, "storageGetItem"],
    [storageJs, "storageSetJson"],
    [datesJs, "generateStardate"],
    [datesJs, "generateNextStardateForDate"],
    [datesJs, "setTodayDefaults"],
    [statusJs, "showStatus"],
    [domJs, "bindClick"],
    [confirmModalJs, "confirmAction"],
    [commandDeckJs, "clearLogHistory"],
    [commandDeckJs, "renderRecentLogsToCommandDeck"],
    [captainsLogJs, "saveCaptainLog"],
    [captainsLogJs, "generateLog"],
    [captainsLogJs, "saveCommandDeckStatus"],
    [captainsLogJs, "setupStardateAutomation"],
    [captainsLogJs, "recalculateStardateForSelectedDate"],
    [captainsLogJs, "loadHistoryEntryFromUrl"],
    [medicalBayJs, "saveMedicalBayLog"],
    [medicalBayJs, "renderMedicalHistory"],
    [medicalBayJs, "getCpapStatus"],
    [medicalBayJs, "buildCpapTrendSummary"],
    [medicalBayJs, "getCpapComplianceSummary"],
    [medicalBayJs, "renderCpapDashboard"],
    [backupJs, "exportBackup"],
    [backupJs, "exportEncryptedBackup"],
    [backupJs, "restoreBackup"],
    [backupJs, "isValidBackup"],
    [backupJs, "isValidCpapEntry"],
    [voiceCaptureJs, "getSpeechRecognitionConstructor"],
    [voiceCaptureJs, "setVoiceCaptureControlsState"]
].forEach(function ([source, exportName]) {
    assert(source.includes(exportName), `Missing modular export or function: ${exportName}`);
});

assert(stylesCss.includes(".visually-hidden"), "Missing visually hidden utility.");
assert(stylesCss.includes(".skip-link"), "Missing skip-link styles.");
assert(stylesCss.includes(":focus-visible"), "Missing keyboard focus styles.");
assert(stylesCss.includes("[hidden]"), "Missing hidden attribute modal fix.");

console.log("Static checks passed.");
