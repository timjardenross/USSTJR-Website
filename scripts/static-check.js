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
    "js/modules/confirm-modal.js",
    "README.md",
    "BACKLOG.md",
    "MEDICAL_BAY_SCOPE.md",
    ".gitignore",
    "scripts/run-checks.js",
    "scripts/behavior-check.js"
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
    "generateLogButton",
    "saveCommandDeckStatusButton",
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
    "saveMedicalLogButton",
    "downloadMedicalLogButton",
    "resetMedicalLogButton",
    "medicalSummaryOutput",
    "medicalHistoryList"
].forEach(function (id) {
    assert(medicalBayHtml.includes(`id="${id}"`), `Missing Medical Bay control: ${id}`);
});

assert(appJs.trim() === 'import "./main.js";', "Legacy app.js should only be a compatibility shim.");

[
    [mainJs, "initialiseApp"],
    [mainJs, "setupActionHandlers"],
    [constantsJs, "CAPTAINS_LOG_DRAFT_KEY"],
    [storageJs, "storageGetItem"],
    [storageJs, "storageSetJson"],
    [datesJs, "generateStardate"],
    [datesJs, "setTodayDefaults"],
    [statusJs, "showStatus"],
    [domJs, "bindClick"],
    [confirmModalJs, "confirmAction"],
    [commandDeckJs, "clearLogHistory"],
    [commandDeckJs, "renderRecentLogsToCommandDeck"],
    [captainsLogJs, "generateLog"],
    [captainsLogJs, "saveCommandDeckStatus"],
    [captainsLogJs, "loadHistoryEntryFromUrl"],
    [medicalBayJs, "saveMedicalBayLog"],
    [medicalBayJs, "renderMedicalHistory"],
    [backupJs, "exportBackup"],
    [backupJs, "exportEncryptedBackup"],
    [backupJs, "restoreBackup"],
    [backupJs, "isValidBackup"],
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
