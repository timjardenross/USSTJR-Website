const fs = require("fs");
const path = require("path");
const vm = require("vm");

const moduleFiles = [
    "js/core/constants.js",
    "js/core/status.js",
    "js/core/storage.js",
    "js/core/dates.js",
    "js/core/dom.js",
    "js/modules/confirm-modal.js",
    "js/modules/voice-capture.js",
    "js/modules/command-deck.js",
    "js/modules/captains-log.js",
    "js/modules/medical-bay.js",
    "js/modules/backup.js",
    "js/main.js"
];
const appSource = moduleFiles.map(function (filePath) {
    return fs.readFileSync(path.join(__dirname, "..", filePath), "utf8")
        .replace(/^import[\s\S]*?;\n/gm, "")
        .replace(/export /g, "");
}).join("\n");

function createElement(initialState) {
    const element = Object.assign({
        addEventListener(eventName, handler) {
            this.listeners[eventName] = this.listeners[eventName] || [];
            this.listeners[eventName].push(handler);
        },
        appendChild(child) {
            this.children.push(child);
        },
        children: [],
        checked: false,
        className: "",
        click() {
            this.clicked = true;
        },
        disabled: false,
        focus() {
            this.focused = true;
        },
        hidden: false,
        href: "",
        listeners: {},
        select() {},
        setSelectionRange() {},
        dispatchEvent(event) {
            (this.listeners[event.type] || []).forEach(function (handler) {
                handler(event);
            });
        },
        type: "",
        value: ""
    }, initialState || {});
    let textContent = element.textContent || "";

    Object.defineProperty(element, "textContent", {
        get() {
            return textContent;
        },
        set(value) {
            textContent = String(value);
            if (textContent !== "") {
                return;
            }
            this.children = [];
        }
    });

    return element;
}

function createContext(options) {
    const settings = options || {};
    const store = {};
    const downloads = [];
    const appendedElements = [];
    let recognitionInstance = null;

    function MockRecognition() {
        recognitionInstance = this;
        this.start = function () {
            if (settings.throwOnRecognitionStart) {
                throw new Error("Recognition start failed");
            }
            this.started = true;
        };
        this.stop = function () {
            this.stopped = true;
            if (this.onend) {
                this.onend();
            }
        };
    }

    const fields = {
        appStatus: createElement({ hidden: true }),
        career: createElement({ value: "Career progress" }),
        challenges: createElement({ value: "Challenge logged" }),
        commandEnergy: createElement({ textContent: "--" }),
        commandMood: createElement({ textContent: "--" }),
        commandPain: createElement({ textContent: "--" }),
        commandStardate: createElement({ textContent: "--" }),
        commandStress: createElement({ textContent: "--" }),
        dateInput: createElement({ value: settings.dateValue === undefined ? "2026-06-04" : settings.dateValue }),
        energy: createElement({ value: "7" }),
        gratitude: createElement({ value: "Gratitude logged" }),
        health: createElement({ value: "Health progress" }),
        historySearchInput: createElement({ value: "" }),
        healthActivities: createElement({ value: "Short walk" }),
        healthAnxiety: createElement({ value: "4" }),
        healthBestPain: createElement({ value: "3" }),
        healthChallenges: createElement({ value: "Pain flare after sitting" }),
        healthDateInput: createElement({ value: "2026-06-04" }),
        healthEnergy: createElement({ value: "6" }),
        healthFatigue: createElement({ value: "5" }),
        healthMood: createElement({ value: "7" }),
        healthObservations: createElement({ value: "Hip felt tighter in the afternoon" }),
        healthOverallPain: createElement({ value: "5" }),
        healthPainLocation: createElement({ value: "Hip and SIJ" }),
        healthPainTypeAche: createElement({ value: "Ache" }),
        healthPainTypeBurning: createElement({ value: "Burning" }),
        healthPainTypeNerve: createElement({ value: "Nerve", checked: true }),
        healthPainTypeSharp: createElement({ value: "Sharp" }),
        healthPainTypeStiffness: createElement({ value: "Stiffness", checked: true }),
        healthSleepHours: createElement({ value: "6.5" }),
        healthSleepQuality: createElement({ value: "6" }),
        healthStress: createElement({ value: "3" }),
        healthTriggers: createElement({ value: "Long sitting block" }),
        healthWakeups: createElement({ value: "2" }),
        healthWins: createElement({ value: "Completed physio" }),
        latestEnergy: createElement({ textContent: "--" }),
        latestEntryStardate: createElement({ textContent: "No entry recorded yet" }),
        latestMood: createElement({ textContent: "--" }),
        latestPain: createElement({ textContent: "--" }),
        latestStress: createElement({ textContent: "--" }),
        lessons: createElement({ value: "Lesson logged" }),
        markdownOutput: createElement(),
        medicalHistoryList: createElement(),
        medicalLatestDate: createElement({ textContent: "No health log recorded yet" }),
        medicalLatestEnergy: createElement({ textContent: "--" }),
        medicalLatestPain: createElement({ textContent: "--" }),
        medicalLatestSleep: createElement({ textContent: "--" }),
        medicalLatestStress: createElement({ textContent: "--" }),
        medicalSummaryOutput: createElement(),
        mindbody: createElement({ value: "Mind body progress" }),
        mood: createElement({ value: "8" }),
        pain: createElement({ value: "2" }),
        priority1: createElement({ value: "Priority one" }),
        priority2: createElement({ value: "Priority two" }),
        priority3: createElement({ value: "Priority three" }),
        recentLogsList: createElement(),
        recordingStatus: createElement({ textContent: "Not recording" }),
        saveCaptainLogButton: createElement(),
        startVoiceCaptureButton: createElement(),
        stardateInput: createElement({ value: settings.stardateValue === undefined ? "260604.01" : settings.stardateValue }),
        stopVoiceCaptureButton: createElement(),
        stress: createElement({ value: "3" }),
        voiceCapture: createElement({ value: "Voice note" }),
        voiceCaptureSupportMessage: createElement({ hidden: true }),
        wins: createElement({ value: "Win logged" })
    };

    const windowObject = {
        addEventListener() {},
        location: {
            search: settings.search || ""
        }
    };

    if (settings.withSpeechRecognition) {
        windowObject.SpeechRecognition = MockRecognition;
    }

    const context = {
        Blob: function Blob(parts, blobOptions) {
            this.parts = parts;
            this.type = blobOptions.type;
        },
        FileReader: function FileReader() {},
        URL: {
            createObjectURL(blob) {
                downloads.push(blob);
                return "blob:test";
            },
            revokeObjectURL() {}
        },
        URLSearchParams,
        Event: function Event(type) {
            this.type = type;
        },
        alert() {
            throw new Error("Unexpected alert call");
        },
        confirm() {
            return settings.confirmResult !== false;
        },
        console: {
            error() {},
            log: console.log
        },
        document: {
            body: {
                appendChild(child) {
                    appendedElements.push(child);
                },
                removeChild() {}
            },
            createElement(tagName) {
                return createElement({ tagName });
            },
            getElementById(id) {
                return fields[id] || null;
            }
        },
        localStorage: {
            get length() {
                return Object.keys(store).length;
            },
            getItem(key) {
                return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
            },
            key(index) {
                return Object.keys(store)[index] || null;
            },
            removeItem(key) {
                delete store[key];
            },
            setItem(key, value) {
                store[key] = String(value);
            }
        },
        window: windowObject
    };

    vm.createContext(context);
    vm.runInContext(appSource, context);
    if (context.setVoiceCaptureDraftSaver && context.saveDraft) {
        context.setVoiceCaptureDraftSaver(context.saveDraft);
    }

    return {
        context,
        appendedElements,
        downloads,
        fields,
        getRecognition() {
            return recognitionInstance;
        },
        store
    };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function testLogHistoryAndBackup() {
    const app = createContext();

    app.context.saveCaptainLog();

    const history = JSON.parse(app.store["usstjr-captains-log-history"]);
    assert(history.length === 1, "Expected one history entry after save.");
    assert(history[0].markdown.includes("Win logged"), "History markdown should include log content.");
    assert(app.fields.markdownOutput.value.includes("Win logged"), "One-click save should generate markdown output.");
    assert(app.fields.appStatus.textContent.includes("saved"), "Save should update in-page status.");

    app.context.saveCaptainLog();
    assert(JSON.parse(app.store["usstjr-captains-log-history"]).length === 1, "Repeated one-click save should update the same log, not duplicate it.");
    assert(app.store["usstjr-stardate-260604"] === "2", "Repeated one-click save should not advance the stardate counter again.");

    app.context.exportBackup();
    const backup = JSON.parse(app.downloads[0].parts[0]);
    assert(backup.logHistory.length === 1, "Backup should include log history.");
    assert(backup.draft.wins === "Win logged", "Backup should include draft.");

    const restored = createContext();
    await restored.context.restoreBackup(backup);
    assert(JSON.parse(restored.store["usstjr-captains-log-history"]).length === 1, "Restore should write history.");
}

async function testCommandDeckSync() {
    const app = createContext();

    app.context.saveCaptainLog();

    assert(app.fields.commandStardate.textContent === "260604.01", "Save should sync Command Deck stardate.");
    assert(app.fields.commandMood.textContent === "8", "Save should sync Command Deck mood.");
    assert(app.fields.commandEnergy.textContent === "7", "Save should sync Command Deck energy.");
    assert(app.fields.commandPain.textContent === "2", "Save should sync Command Deck pain.");
    assert(app.fields.commandStress.textContent === "3", "Save should sync Command Deck stress.");
    assert(app.fields.latestEntryStardate.textContent === "260604.01", "Save should sync latest entry stardate.");

    const backup = app.context.buildBackup();
    const restored = createContext();

    await restored.context.restoreBackup(backup);
    assert(restored.fields.commandStardate.textContent === "260604.01", "Restore should sync Command Deck stardate.");
    assert(restored.fields.commandMood.textContent === "8", "Restore should sync Command Deck mood.");
    assert(restored.fields.latestEnergy.textContent === "7", "Restore should sync latest energy.");

    const restoredEntry = JSON.parse(restored.store["usstjr-captains-log-history"])[0];
    await restored.context.deleteHistoryEntry(restoredEntry.id);
    assert(restored.fields.commandStardate.textContent === "--", "Deleting only log should reset Command Deck stardate.");
    assert(restored.fields.commandMood.textContent === "--", "Deleting only log should reset Command Deck mood.");
    assert(restored.fields.latestEntryStardate.textContent === "No entry recorded yet", "Deleting only log should reset latest entry.");

    app.context.saveCaptainLog();
    await app.context.clearLogHistory();
    assert(app.fields.commandEnergy.textContent === "--", "Clearing history should reset Command Deck energy.");
    assert(app.fields.latestStress.textContent === "--", "Clearing history should reset latest stress.");
}

async function testHistoryControls() {
    const app = createContext();

    app.context.saveCaptainLog();
    const entry = JSON.parse(app.store["usstjr-captains-log-history"])[0];

    app.context.downloadHistoryEntry(entry.id);
    assert(app.downloads.length === 1, "History download should create a download.");

    await app.context.deleteHistoryEntry(entry.id);
    assert(JSON.parse(app.store["usstjr-captains-log-history"]).length === 0, "Delete should remove history entry.");

    app.context.saveCaptainLog();
    await app.context.clearLogHistory();
    assert(JSON.parse(app.store["usstjr-captains-log-history"]).length === 0, "Clear history should empty history.");
    assert(app.fields.latestEntryStardate.textContent === "No entry recorded yet", "Clear history should reset latest UI.");
}

async function testDownloadAndResetWorkflows() {
    const app = createContext();

    app.context.generateLog();
    app.context.downloadLog();
    assert(app.downloads.length === 1, "Generated markdown download should create a download.");
    assert(app.downloads[0].type === "text/markdown", "Generated markdown download should use markdown MIME type.");
    assert(app.downloads[0].parts[0].includes("Win logged"), "Generated markdown download should include log content.");
    assert(app.appendedElements[0].download === "2026-06-04-Stardate-260604.01.md", "Generated markdown download filename should include date and stardate.");

    app.context.saveCaptainLog();
    const entry = JSON.parse(app.store["usstjr-captains-log-history"])[0];

    app.context.downloadHistoryEntry(entry.id);
    assert(app.downloads.length === 2, "Saved log download should create a second download.");
    assert(app.downloads[1].type === "text/markdown", "Saved log download should use markdown MIME type.");
    assert(app.downloads[1].parts[0].includes("Win logged"), "Saved log download should include saved log content.");

    app.context.exportBackup();
    assert(app.downloads.length === 3, "Backup export should create a third download.");
    assert(app.downloads[2].type === "application/json", "Backup export should use JSON MIME type.");
    assert(JSON.parse(app.downloads[2].parts[0]).logHistory.length === 1, "Backup export should include saved log history.");

    assert(app.store["usstjr-captains-log-draft"], "Generated log should save a draft before reset.");
    await app.context.clearDraftAndResetForm();
    assert(!app.store["usstjr-captains-log-draft"], "Reset should clear saved draft.");
    assert(app.fields.wins.value === "", "Reset should clear written log fields.");
    assert(app.fields.markdownOutput.value === "", "Reset should clear generated markdown.");
    assert(app.fields.dateInput.value !== "", "Reset should restore a date default.");
    assert(app.fields.stardateInput.value !== "", "Reset should restore a stardate default.");
    assert(app.fields.appStatus.textContent.includes("reset"), "Reset should update in-page status.");

    const canceled = createContext({
        confirmResult: false
    });
    canceled.context.generateLog();
    await canceled.context.clearDraftAndResetForm();
    assert(canceled.store["usstjr-captains-log-draft"], "Canceled reset should keep saved draft.");
    assert(canceled.fields.wins.value === "Win logged", "Canceled reset should keep form fields.");
}

async function testStardateAutomation() {
    const empty = createContext({
        stardateValue: ""
    });

    empty.context.setTodayDefaults();
    assert(empty.fields.stardateInput.value === "260604.01", "Empty stardate should populate from current date.");

    empty.context.setupStardateAutomation();
    empty.fields.stardateInput.value = "260604.01";
    empty.fields.dateInput.value = "2026-06-05";
    empty.fields.dateInput.dispatchEvent(new empty.context.Event("change"));
    assert(empty.fields.stardateInput.value === "260605.01", "Date change should recalculate existing stardate.");

    const multiple = createContext({
        stardateValue: ""
    });

    multiple.context.setTodayDefaults();
    assert(multiple.fields.stardateInput.value === "260604.01", "First log should use .01.");
    multiple.context.saveCaptainLog();

    multiple.fields.stardateInput.value = "";
    multiple.context.recalculateStardateForSelectedDate({
        force: true
    });
    assert(multiple.fields.stardateInput.value === "260604.02", "Second new log on same date should use .02.");
    multiple.context.saveCaptainLog();
    assert(multiple.store["usstjr-stardate-260604"] === "3", "Counter should advance after second save.");

    const original = createContext();
    original.context.saveCaptainLog();
    const entry = JSON.parse(original.store["usstjr-captains-log-history"])[0];
    const restored = createContext({
        search: `?log=${encodeURIComponent(entry.id)}`,
        stardateValue: "",
        dateValue: ""
    });

    Object.assign(restored.store, original.store);
    const counterBeforeRestore = restored.store["usstjr-stardate-260604"];
    restored.context.loadHistoryEntryFromUrl();
    assert(restored.fields.stardateInput.value === "260604.01", "Loading saved log should preserve stardate.");
    assert(restored.store["usstjr-stardate-260604"] === counterBeforeRestore, "Loading saved log should not advance counter.");

    const draft = createContext({
        stardateValue: "",
        dateValue: ""
    });
    draft.store["usstjr-captains-log-draft"] = JSON.stringify({
        stardateInput: "260604.09",
        dateInput: "2026-06-04",
        wins: "Draft wins"
    });
    draft.context.setTodayDefaults();
    draft.context.loadDraft();
    assert(draft.fields.stardateInput.value === "260604.09", "Draft stardate should be preserved.");

    const reset = createContext();
    reset.context.saveCaptainLog();
    await reset.context.clearDraftAndResetForm();
    assert(reset.fields.stardateInput.value === "260604.02", "Reset should generate next stardate for today.");
}

async function testMedicalBayCoreTracking() {
    const app = createContext();

    app.context.saveMedicalBayLog();

    const history = JSON.parse(app.store["usstjr-medical-bay-history"]);
    assert(history.length === 1, "Medical Bay save should create a history entry.");
    assert(history[0].overallPain === "5", "Medical Bay history should store overall pain.");
    assert(history[0].painTypes.includes("Nerve"), "Medical Bay history should store selected pain types.");
    assert(app.fields.medicalLatestDate.textContent === "2026-06-04", "Medical Bay latest date should update.");
    assert(app.fields.medicalLatestPain.textContent === "5", "Medical Bay latest pain should update.");
    assert(app.fields.medicalSummaryOutput.value.includes("Health Intelligence"), "Medical Bay save should generate markdown.");
    assert(app.fields.medicalSummaryOutput.value.includes("Long sitting block"), "Medical Bay summary should include triggers.");

    app.context.downloadMedicalBayLog();
    assert(app.downloads.length === 1, "Medical Bay markdown download should create a download.");
    assert(app.downloads[0].type === "text/markdown", "Medical Bay download should use markdown MIME type.");
    assert(app.appendedElements[0].download === "2026-06-04-Medical-Bay.md", "Medical Bay download filename should include date.");

    const backup = app.context.buildBackup();
    assert(backup.medicalBay.history.length === 1, "Backup should include Medical Bay history.");
    assert(backup.medicalBay.draft.healthTriggers === "Long sitting block", "Backup should include Medical Bay draft.");

    const restored = createContext();
    await restored.context.restoreBackup(backup);
    assert(JSON.parse(restored.store["usstjr-medical-bay-history"]).length === 1, "Restore should write Medical Bay history.");
    assert(restored.fields.medicalLatestEnergy.textContent === "6", "Restore should sync Medical Bay latest energy.");

    await app.context.resetMedicalBayForm();
    assert(!app.store["usstjr-medical-bay-draft"], "Medical Bay reset should clear draft.");
    assert(app.fields.healthTriggers.value === "", "Medical Bay reset should clear notes.");
    assert(app.fields.healthPainTypeNerve.checked === false, "Medical Bay reset should clear pain type checkboxes.");
    assert(app.fields.appStatus.textContent.includes("reset"), "Medical Bay reset should update status.");
}

function testHistorySearch() {
    const app = createContext();

    app.context.saveCaptainLog();

    app.fields.historySearchInput.value = "Win logged";
    app.context.renderRecentLogsToCommandDeck();
    assert(app.fields.recentLogsList.children.length === 1, "Matching search should keep the saved log visible.");

    app.fields.historySearchInput.value = "missing search term";
    app.context.renderRecentLogsToCommandDeck();
    assert(app.fields.recentLogsList.children[0].textContent === "No logs match that search.", "Non-matching search should show an empty state.");
}

function testHistoryRestoreFromUrl() {
    const original = createContext();

    original.context.saveCaptainLog();
    const entry = JSON.parse(original.store["usstjr-captains-log-history"])[0];
    const restored = createContext({
        search: `?log=${encodeURIComponent(entry.id)}`
    });

    Object.assign(restored.store, original.store);
    restored.context.loadHistoryEntryFromUrl();
    assert(restored.fields.wins.value === "Win logged", "History URL restore should populate fields.");
}

function testInvalidBackupRejected() {
    const app = createContext();

    assert(!app.context.isValidBackup({ version: 1, logHistory: [{ id: 123 }] }), "Invalid backup should fail validation.");
}

function testVoiceCaptureStates() {
    const unsupported = createContext();

    unsupported.context.setVoiceCaptureControlsState();
    assert(unsupported.fields.recordingStatus.textContent === "Voice capture unavailable", "Unsupported voice status missing.");
    assert(unsupported.fields.startVoiceCaptureButton.disabled, "Unsupported start button should be disabled.");
    assert(unsupported.fields.voiceCaptureSupportMessage.hidden === false, "Unsupported voice message should be visible.");
    unsupported.context.startVoiceCapture();
    assert(unsupported.fields.recordingStatus.textContent === "Voice capture unavailable", "Unsupported start should leave unavailable status.");

    const supported = createContext({
        withSpeechRecognition: true
    });

    supported.context.setVoiceCaptureControlsState();
    supported.context.startVoiceCapture();
    assert(supported.fields.recordingStatus.textContent === "Recording", "Recording status missing.");
    assert(supported.fields.startVoiceCaptureButton.disabled, "Start button should disable while recording.");
    assert(!supported.fields.stopVoiceCaptureButton.disabled, "Stop button should enable while recording.");

    const recognition = supported.getRecognition();
    recognition.onresult({
        resultIndex: 0,
        results: [{
            0: {
                transcript: "captured"
            },
            isFinal: true
        }, {
            0: {
                transcript: " interim"
            },
            isFinal: false
        }]
    });
    assert(supported.fields.voiceCapture.value.includes("captured"), "Transcript should update.");
    assert(supported.fields.voiceCapture.value.includes("interim"), "Interim transcript should update.");
    assert(JSON.parse(supported.store["usstjr-captains-log-draft"]).voiceCapture.includes("interim"), "Voice transcript should save draft.");

    supported.context.startVoiceCapture();
    assert(supported.getRecognition() === recognition, "Starting while recording should not replace active recognition.");

    supported.context.stopVoiceCapture();
    assert(recognition.stopped, "Stop should stop active recognition.");
    assert(supported.fields.recordingStatus.textContent === "Recording stopped", "Stop should update status.");
    assert(!supported.fields.startVoiceCaptureButton.disabled, "Start button should re-enable after stop.");
    assert(supported.fields.stopVoiceCaptureButton.disabled, "Stop button should disable after stop.");

    supported.context.stopVoiceCapture();
    assert(supported.fields.recordingStatus.textContent === "Recording stopped", "Second stop should leave stopped status.");

    const startFailure = createContext({
        throwOnRecognitionStart: true,
        withSpeechRecognition: true
    });

    startFailure.context.startVoiceCapture();
    assert(startFailure.fields.recordingStatus.textContent === "Unable to start voice capture", "Start failure should be reported.");
    assert(!startFailure.fields.startVoiceCaptureButton.disabled, "Start failure should leave start available.");

    supported.context.startVoiceCapture();
    const secondRecognition = supported.getRecognition();
    assert(secondRecognition.started, "Second recognition should start before error mapping.");
    secondRecognition.onerror({
        error: "not-allowed"
    });
    assert(supported.fields.recordingStatus.textContent === "Microphone permission denied", "Permission error should be mapped.");
    assert(!supported.fields.startVoiceCaptureButton.disabled, "Permission error should re-enable start.");

    const networkFailure = createContext({
        withSpeechRecognition: true
    });

    networkFailure.context.startVoiceCapture();
    networkFailure.getRecognition().onerror({
        error: "network"
    });
    assert(networkFailure.fields.recordingStatus.textContent === "Speech service unavailable", "Network error should be mapped.");
}

async function main() {
    await testLogHistoryAndBackup();
    await testCommandDeckSync();
    await testHistoryControls();
    await testDownloadAndResetWorkflows();
    await testStardateAutomation();
    await testMedicalBayCoreTracking();
    testHistorySearch();
    testHistoryRestoreFromUrl();
    testInvalidBackupRejected();
    testVoiceCaptureStates();

    console.log("Behavior checks passed.");
}

main().catch(function (error) {
    console.error(error);
    process.exit(1);
});
