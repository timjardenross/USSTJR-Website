const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
    "index.html",
    "captains-log.html",
    "medical-bay.html",
    "css/styles.css",
    "js/app.js",
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

[indexHtml, captainsLogHtml, medicalBayHtml].forEach(function (html) {
    assert(!/\son[a-z]+="/i.test(html), "Inline event handlers are not allowed.");
    assert(html.includes('href="#mainContent"'), "Missing skip link.");
    assert(html.includes('id="mainContent"'), "Missing main content landmark.");
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

[
    "exportBackup",
    "exportEncryptedBackup",
    "importBackup",
    "importEncryptedBackup",
    "setupActionHandlers",
    "confirmAction",
    "restoreBackup",
    "isValidBackup",
    "encryptBackup",
    "decryptBackup",
    "deriveEncryptionKey",
    "storageGetItem",
    "storageSetItem",
    "storageGetJson",
    "showStatus",
    "clearLogHistory",
    "deleteHistoryEntry",
    "downloadHistoryEntry",
    "getHistoryEntrySearchText",
    "saveMedicalBayLog",
    "downloadMedicalBayLog",
    "resetMedicalBayForm",
    "getMedicalBayData",
    "buildMedicalBayMarkdown",
    "renderMedicalHistory",
    "loadLatestMedicalEntry",
    "getSpeechRecognitionConstructor",
    "setVoiceCaptureControlsState",
    "getVoiceCaptureErrorMessage"
].forEach(function (functionName) {
    assert(appJs.includes(`function ${functionName}`), `Missing function: ${functionName}`);
});

assert(stylesCss.includes(".visually-hidden"), "Missing visually hidden utility.");
assert(stylesCss.includes(".skip-link"), "Missing skip-link styles.");
assert(stylesCss.includes(":focus-visible"), "Missing keyboard focus styles.");

console.log("Static checks passed.");
