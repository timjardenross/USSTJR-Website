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
    "js/modules/local-query-engine.js",
    "js/modules/computer-core.js",
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
        attributes: {},
        select() {},
        setSelectionRange() {},
        setAttribute(name, value) {
            this.attributes[name] = String(value);
        },
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
    const timers = [];
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
        askComputerButton: createElement(),
        computerQuestionInput: createElement({ value: "" }),
        computerResponse: createElement(),
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
        healthWorstPain: createElement({ value: "7" }),
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
        cpapAverageAhi: createElement({ textContent: "--" }),
        cpapAverageScore: createElement({ textContent: "--" }),
        cpapAverageUsage: createElement({ textContent: "--" }),
        cpapCompliance: createElement({ textContent: "--" }),
        cpapDateInput: createElement({ value: "2026-06-04" }),
        cpapEventsPerHour: createElement({ value: "1.1" }),
        cpapLatestAhi: createElement({ textContent: "--" }),
        cpapLatestScore: createElement({ textContent: "--" }),
        cpapLatestStatus: createElement({ textContent: "--" }),
        cpapLatestUsage: createElement({ textContent: "--" }),
        cpapMaskOffCount: createElement({ value: "0" }),
        cpapMaskSeal: createElement({ value: "20" }),
        cpapNotes: createElement({ value: "Mask fit stable" }),
        cpapScore: createElement({ value: "94" }),
        cpapUsageTime: createElement({ value: "07:42" }),
        weightCurrent: createElement({ textContent: "--" }),
        weightDateInput: createElement({ value: "2026-06-04" }),
        weightFourWeekTrend: createElement({ textContent: "--" }),
        weightHighest: createElement({ textContent: "--" }),
        weightKg: createElement({ value: "121.3" }),
        weightLowest: createElement({ textContent: "--" }),
        weightNotes: createElement({ value: "Week 2 on program" }),
        weightOverallTrend: createElement({ textContent: "--" }),
        weightTrendDirection: createElement({ textContent: "--" }),
        weightTwelveWeekTrend: createElement({ textContent: "--" }),
        weightWaistCm: createElement({ value: "118" }),
        weightWeeklyChange: createElement({ textContent: "--" }),
        mindbody: createElement({ value: "Mind body progress" }),
        mood: createElement({ value: "8" }),
        pain: createElement({ value: "2" }),
        priority1: createElement({ value: "Priority one" }),
        priority2: createElement({ value: "Priority two" }),
        priority3: createElement({ value: "Priority three" }),
        recentLogsList: createElement(),
        recordingStatus: createElement({ textContent: "Not recording" }),
        saveCaptainLogButton: createElement(),
        showMedicalHistoryButton: createElement({ hidden: true }),
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
        clearTimeout(timer) {
            if (timer) {
                timer.active = false;
            }
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
        setTimeout(callback, delay) {
            const timer = {
                active: true,
                callback,
                delay
            };
            timers.push(timer);
            return timer;
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
        runTimers() {
            timers.slice().forEach(function (timer) {
                if (timer.active) {
                    timer.active = false;
                    timer.callback();
                }
            });
        },
        store
    };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function createVoiceSystemContext(options) {
    const settings = options || {};
    const store = Object.assign({}, settings.store || {});
    const utterances = [];
    const spoken = [];
    const windowObject = {
        USSTJR: {}
    };

    if (settings.withSpeechSynthesis !== false) {
        windowObject.speechSynthesis = {
            cancel() {},
            getVoices() {
                return [{
                    lang: "en-US",
                    name: "Test English"
                }];
            },
            speak(utterance) {
                spoken.push(utterance);
                if (utterance.onend) {
                    utterance.onend();
                }
            }
        };
    }

    const context = {
        console: {
            log() {},
            warn() {}
        },
        localStorage: {
            getItem(key) {
                return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
            },
            setItem(key, value) {
                store[key] = String(value);
            }
        },
        setTimeout(callback) {
            callback();
        },
        SpeechSynthesisUtterance: function SpeechSynthesisUtterance(text) {
            this.text = text;
            utterances.push(this);
        },
        window: windowObject
    };

    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js/voice-system.js"), "utf8"), context);

    return {
        context,
        spoken,
        store,
        utterances
    };
}

async function testVoiceSystemPreferenceGate() {
    const disabled = createVoiceSystemContext();

    assert(disabled.context.window.USSTJR.Voice.isEnabled() === false, "Voice should be disabled by default.");
    await disabled.context.window.USSTJR.Voice.speak("test");
    assert(disabled.utterances.length === 0, "Disabled voice should not create an utterance.");
    assert(disabled.spoken.length === 0, "Disabled voice should not queue speech.");

    disabled.context.window.USSTJR.Voice.setEnabled(true);
    assert(disabled.store["usstjr-voice-enabled"] === "true", "Voice enabled preference should persist.");
    assert(disabled.context.window.USSTJR.Voice.isEnabled() === true, "Voice should report enabled after setEnabled(true).");
    await disabled.context.window.USSTJR.Voice.speak("test");
    assert(disabled.utterances.length === 1, "Enabled voice should create an utterance.");
    assert(disabled.spoken.length === 1, "Enabled voice should queue speech synthesis.");

    disabled.context.window.USSTJR.Voice.setEnabled(false);
    assert(disabled.store["usstjr-voice-enabled"] === "false", "Voice disabled preference should persist.");
    assert(disabled.context.window.USSTJR.Voice.isEnabled() === false, "Voice should report disabled after setEnabled(false).");
}

function testVoiceSystemLoadsPersistedPreference() {
    const enabled = createVoiceSystemContext({
        store: {
            "usstjr-voice-enabled": "true"
        }
    });

    assert(enabled.context.window.USSTJR.Voice.isEnabled() === true, "Voice should load persisted enabled preference.");
}

function testVoiceSystemUnsupportedBrowser() {
    const unsupported = createVoiceSystemContext({
        withSpeechSynthesis: false
    });

    assert(unsupported.context.window.USSTJR.Voice.isReady() === false, "Unsupported voice system should not report ready.");
    assert(unsupported.context.window.USSTJR.Voice.isEnabled() === false, "Unsupported voice system should still default disabled.");
}

function testStatusAutoDismissBehavior() {
    const success = createContext();

    success.context.showStatus("Captain's Log saved.", "success");
    assert(success.fields.appStatus.hidden === false, "Success status should display immediately.");
    assert(success.fields.appStatus.textContent === "Captain's Log saved.", "Success status text should render.");
    success.runTimers();
    assert(success.fields.appStatus.hidden === true, "Success status should auto-dismiss.");
    assert(success.fields.appStatus.textContent === "", "Auto-dismissed status should clear text.");

    const error = createContext();

    error.context.showStatus("Backup import failed.", "error");
    error.runTimers();
    assert(error.fields.appStatus.hidden === false, "Error status should remain visible.");
    assert(error.fields.appStatus.textContent === "Backup import failed.", "Error status text should persist.");

    const race = createContext();

    race.context.showStatus("Backup exported.", "success");
    race.context.showStatus("Unable to import backup.", "error");
    race.runTimers();
    assert(race.fields.appStatus.hidden === false, "Older success timer should not clear a newer error.");
    assert(race.fields.appStatus.textContent === "Unable to import backup.", "Newer error should remain after old success timer.");
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
    const expectedResetStardate = reset.context.generateNextStardateForDate(reset.fields.dateInput.value, reset.context.getLogHistory().map(function (entry) {
        return entry.stardate;
    }));
    assert(reset.fields.stardateInput.value === expectedResetStardate, "Reset should generate next stardate for the reset date.");
}

async function testMedicalBayCoreTracking() {
    const app = createContext();

    app.context.saveMedicalBayLog();

    const history = JSON.parse(app.store["usstjr-medical-bay-history"]);
    assert(history.length === 1, "Medical Bay save should create a history entry.");
    assert(history[0].overallPain === "5", "Medical Bay history should store overall pain.");
    assert(history[0].painTypes.includes("Nerve"), "Medical Bay history should store selected pain types.");
    assert(history[0].cpap.score === 94, "Medical Bay history should store CPAP score.");
    assert(history[0].cpap.usageMinutes === 462, "Medical Bay history should store CPAP usage as minutes.");
    assert(history[0].weight.weight === 121.3, "Medical Bay history should store weight entry.");
    assert(history[0].weight.waist === 118, "Medical Bay history should store waist measurement.");
    assert(app.fields.medicalLatestDate.textContent === "2026-06-04", "Medical Bay latest date should update.");
    assert(app.fields.medicalLatestPain.textContent === "5", "Medical Bay latest pain should update.");
    assert(app.fields.medicalSummaryOutput.value.includes("Health Intelligence"), "Medical Bay save should generate markdown.");
    assert(app.fields.medicalSummaryOutput.value.includes("CPAP Summary"), "Medical Bay summary should include CPAP summary.");
    assert(app.fields.medicalSummaryOutput.value.includes("Weight Summary"), "Medical Bay summary should include weight summary.");
    assert(app.fields.medicalSummaryOutput.value.includes("Long sitting block"), "Medical Bay summary should include triggers.");

    app.context.downloadMedicalBayLog();
    assert(app.downloads.length === 1, "Medical Bay markdown download should create a download.");
    assert(app.downloads[0].type === "text/markdown", "Medical Bay download should use markdown MIME type.");
    assert(app.appendedElements[0].download === "2026-06-04-Medical-Bay.md", "Medical Bay download filename should include date.");

    const backup = app.context.buildBackup();
    assert(backup.medicalBay.history.length === 1, "Backup should include Medical Bay history.");
    assert(backup.medicalBay.history[0].cpap.score === 94, "Backup should include CPAP data.");
    assert(backup.medicalBay.history[0].weight.weight === 121.3, "Backup should include weight data.");
    assert(backup.medicalBay.draft.healthTriggers === "Long sitting block", "Backup should include Medical Bay draft.");
    assert(backup.medicalBay.draft.cpapUsageTime === "07:42", "Backup should include CPAP draft data.");
    assert(backup.medicalBay.draft.weightKg === "121.3", "Backup should include weight draft data.");

    const restored = createContext();
    await restored.context.restoreBackup(backup);
    assert(JSON.parse(restored.store["usstjr-medical-bay-history"]).length === 1, "Restore should write Medical Bay history.");
    assert(restored.fields.medicalLatestEnergy.textContent === "6", "Restore should sync Medical Bay latest energy.");
    assert(restored.fields.cpapLatestScore.textContent === "94", "Restore should sync latest CPAP score.");
    assert(restored.fields.weightCurrent.textContent === "121.3 kg", "Restore should sync current weight.");

    await app.context.resetMedicalBayForm();
    assert(!app.store["usstjr-medical-bay-draft"], "Medical Bay reset should clear draft.");
    assert(app.fields.healthTriggers.value === "", "Medical Bay reset should clear notes.");
    assert(app.fields.healthPainTypeNerve.checked === false, "Medical Bay reset should clear pain type checkboxes.");
    assert(app.fields.weightKg.value === "", "Medical Bay reset should clear weight.");
    assert(app.fields.appStatus.textContent.includes("reset"), "Medical Bay reset should update status.");
}

function testMedicalBayHistoryShowAllToggle() {
    const app = createContext();
    const history = Array.from({ length: 7 }, function (_, index) {
        const day = 10 - index;

        return {
            id: `medical-2026-06-${String(day).padStart(2, "0")}`,
            date: `2026-06-${String(day).padStart(2, "0")}`,
            overallPain: String(index),
            sleepHours: "7",
            wakeups: "1",
            energy: "6",
            mood: "7",
            stress: "3",
            triggers: `Trigger ${index}`,
            updatedAt: `2026-06-${String(day).padStart(2, "0")}T00:00:00.000Z`
        };
    });

    app.context.saveMedicalBayHistory(history);
    app.context.renderMedicalHistory();

    assert(app.fields.medicalHistoryList.children.length === 5, "Medical Bay history should show five entries by default.");
    assert(app.fields.medicalHistoryList.children[0].children[0].textContent === "2026-06-10", "Medical Bay history should preserve latest-first ordering.");
    assert(app.fields.medicalHistoryList.children[4].children[0].textContent === "2026-06-06", "Default Medical Bay history should stop at the fifth entry.");
    assert(app.fields.showMedicalHistoryButton.hidden === false, "Show All button should appear when more than five entries exist.");
    assert(app.fields.showMedicalHistoryButton.textContent === "Show All History", "Collapsed history button label should invite expansion.");
    assert(app.fields.showMedicalHistoryButton.attributes["aria-expanded"] === "false", "Collapsed history button should expose aria-expanded false.");

    app.context.toggleMedicalHistoryDisplay();
    assert(app.fields.medicalHistoryList.children.length === 7, "Show All should reveal all stored Medical Bay entries.");
    assert(app.fields.medicalHistoryList.children[6].children[0].textContent === "2026-06-04", "Expanded Medical Bay history should include the oldest stored entry.");
    assert(app.fields.showMedicalHistoryButton.textContent === "Show Less", "Expanded history button label should offer collapse.");
    assert(app.fields.showMedicalHistoryButton.attributes["aria-expanded"] === "true", "Expanded history button should expose aria-expanded true.");

    app.context.toggleMedicalHistoryDisplay();
    assert(app.fields.medicalHistoryList.children.length === 5, "Show Less should return Medical Bay history to five entries.");

    const shortHistory = createContext();
    shortHistory.context.saveMedicalBayHistory(history.slice(0, 2));
    shortHistory.context.renderMedicalHistory();
    assert(shortHistory.fields.medicalHistoryList.children.length === 2, "Short Medical Bay history should show all available entries.");
    assert(shortHistory.fields.showMedicalHistoryButton.hidden === true, "Show All button should stay hidden when fewer than six entries exist.");
}

function testComputerCoreLocalQueries() {
    const empty = createContext();
    const emptyAnswer = empty.context.answerLocalQuery("sleep");

    assert(emptyAnswer.empty === true, "Computer Core should return an empty state with no records.");
    assert(emptyAnswer.observation.includes("No local records found yet"), "Computer Core empty state should guide the user.");

    const app = createContext();
    app.context.saveCaptainLog();
    app.context.saveMedicalBayLog();

    const latestLog = app.context.answerLocalQuery("latest log");
    assert(latestLog.title === "Latest Captain's Log", "Computer Core should answer latest log queries.");
    assert(latestLog.sections[0].items.join(" ").includes("260604.01"), "Latest Captain's Log answer should include stardate.");

    const sleepTrend = app.context.answerLocalQuery("sleeping and rest");
    assert(sleepTrend.title === "Sleep Trend", "Computer Core should route sleep keywords to sleep trend.");
    assert(sleepTrend.sections[0].items.join(" ").includes("Latest sleep: 6.5 hours"), "Sleep trend should include latest sleep.");

    const painTrend = app.context.answerLocalQuery("pain trend");
    assert(painTrend.title === "Pain Trend", "Computer Core should route pain keywords to pain trend.");
    assert(painTrend.sections[0].items.join(" ").includes("Latest pain: 5"), "Pain trend should include latest pain.");

    const medical = app.context.answerLocalQuery("medical bay");
    assert(medical.title === "Latest Medical Bay Entry", "Computer Core should route medical keywords to Medical Bay.");

    const summary = app.context.answerLocalQuery("summarise 7 days");
    assert(summary.title === "Summarise Last 7 Days", "Computer Core should route summary keywords to seven-day summary.");
    assert(summary.sections[0].items.join(" ").includes("Captain's Logs: 1"), "Seven-day summary should include Captain's Log count.");
    assert(app.context.getFutureStorageKeys().includes("usstjr-cpap-history"), "Computer Core should expose future storage key architecture.");

    app.context.submitComputerCoreQuery("pain");
    assert(app.fields.computerResponse.children.length > 0, "Computer Core submit should render a response.");
    assert(app.fields.computerResponse.children[0].textContent === "Pain Trend", "Computer Core rendered response should show query title.");
}

function testMedicalBayZeroMetricRendering() {
    const app = createContext();

    app.fields.healthOverallPain.value = "0";
    app.fields.healthBestPain.value = "0";
    app.fields.healthWorstPain.value = "0";
    app.fields.healthMood.value = "0";
    app.fields.healthStress.value = "0";
    app.fields.healthSleepHours.value = "0";
    app.fields.healthSleepQuality.value = "0";
    app.fields.healthWakeups.value = "0";
    app.fields.healthEnergy.value = "0";
    app.fields.healthFatigue.value = "0";

    app.context.saveMedicalBayLog();

    assert(app.fields.medicalLatestPain.textContent === "0", "Medical Bay latest pain should render zero.");
    assert(app.fields.medicalLatestSleep.textContent === "0", "Medical Bay latest sleep should render zero.");
    assert(app.fields.medicalLatestEnergy.textContent === "0", "Medical Bay latest energy should render zero.");
    assert(app.fields.medicalLatestStress.textContent === "0", "Medical Bay latest stress should render zero.");
    assert(app.fields.medicalHistoryList.children[0].children[1].textContent.includes("Pain 0"), "Medical Bay history should render zero pain.");
    assert(app.fields.medicalHistoryList.children[0].children[1].textContent.includes("Sleep 0h"), "Medical Bay history should render zero sleep.");
    assert(app.fields.medicalHistoryList.children[0].children[1].textContent.includes("Wakeups 0"), "Medical Bay history should render zero wakeups.");
    assert(app.fields.medicalHistoryList.children[0].children[1].textContent.includes("Energy 0"), "Medical Bay history should render zero energy.");
    assert(app.fields.medicalHistoryList.children[0].children[1].textContent.includes("Mood 0"), "Medical Bay history should render zero mood.");
    assert(app.fields.medicalSummaryOutput.value.includes("Current pain is 0 with worst pain 0."), "Medical Bay trend summary should render zero pain.");
    assert(app.fields.medicalSummaryOutput.value.includes("Sleep was 0 hours at quality 0."), "Medical Bay trend summary should render zero sleep.");

    const latestMedical = app.context.answerLocalQuery("medical bay");
    const medicalItems = latestMedical.sections[0].items.join(" ");
    assert(medicalItems.includes("Pain: 0"), "Computer Core latest Medical Bay response should render zero pain.");
    assert(medicalItems.includes("Sleep: 0 hours"), "Computer Core latest Medical Bay response should render zero sleep.");
    assert(medicalItems.includes("Wakeups: 0"), "Computer Core latest Medical Bay response should render zero wakeups.");

    const missing = createContext();
    missing.context.saveMedicalBayHistory([{
        id: "medical-missing",
        date: "2026-06-03",
        painTypes: [],
        updatedAt: "2026-06-03T00:00:00.000Z"
    }]);
    missing.context.loadLatestMedicalEntry();
    missing.context.renderMedicalHistory();

    assert(missing.fields.medicalLatestPain.textContent === "--", "Missing Medical Bay pain should render placeholder.");
    assert(missing.fields.medicalHistoryList.children[0].children[1].textContent.includes("Pain --"), "Missing Medical Bay history pain should render placeholder.");
    assert(missing.fields.medicalHistoryList.children[0].children[1].textContent.includes("Wakeups --"), "Missing Medical Bay history wakeups should render placeholder.");
}

function testCpapComplianceMonitoring() {
    const app = createContext();

    app.context.saveMedicalBayLog();
    assert(app.fields.cpapLatestScore.textContent === "94", "CPAP dashboard should show latest score.");
    assert(app.fields.cpapLatestUsage.textContent === "7h 42m", "CPAP dashboard should show latest usage.");
    assert(app.fields.cpapLatestAhi.textContent === "1.1", "CPAP dashboard should show latest AHI.");
    assert(app.fields.cpapLatestStatus.textContent === "🟢 Excellent", "CPAP dashboard should show latest status.");
    assert(app.fields.cpapAverageScore.textContent === "94.0", "CPAP dashboard should show average score.");
    assert(app.fields.cpapAverageUsage.textContent === "7h 42m", "CPAP dashboard should show average usage.");
    assert(app.fields.cpapCompliance.textContent === "100% (1/1)", "CPAP dashboard should show compliance percentage.");
    assert(app.context.parseCpapUsageTime("07:42") === 462, "CPAP usage parser should convert HH:MM to minutes.");
    assert(app.context.formatCpapUsage(462) === "7h 42m", "CPAP formatter should display minutes as hours and minutes.");
    assert(app.context.getCpapStatus(84) === "🟡 Good", "CPAP status should classify good scores.");
    assert(app.context.getCpapStatus(74) === "🟠 Fair", "CPAP status should classify fair scores.");
    assert(app.context.getCpapStatus(69) === "🔴 Poor", "CPAP status should classify poor scores.");

    const cpapEntries = [
        { date: "2026-06-07", score: 94, usageMinutes: 462, maskSeal: 20, eventsPerHour: 1.1, maskOffCount: 0, notes: "" },
        { date: "2026-06-06", score: 84, usageMinutes: 240, maskSeal: 18, eventsPerHour: 2.0, maskOffCount: 1, notes: "" },
        { date: "2026-06-05", score: 74, usageMinutes: 239, maskSeal: 16, eventsPerHour: 3.4, maskOffCount: 2, notes: "" },
        { date: "2026-06-04", score: 69, usageMinutes: 300, maskSeal: 14, eventsPerHour: 5.2, maskOffCount: 2, notes: "" },
        { date: "2026-06-03", score: 90, usageMinutes: 420, maskSeal: 20, eventsPerHour: 0.8, maskOffCount: 0, notes: "" },
        { date: "2026-06-02", score: 80, usageMinutes: 180, maskSeal: 17, eventsPerHour: 2.5, maskOffCount: 1, notes: "" },
        { date: "2026-06-01", score: 70, usageMinutes: 360, maskSeal: 15, eventsPerHour: 4.0, maskOffCount: 2, notes: "" }
    ];
    const summary = app.context.buildCpapTrendSummary(cpapEntries);

    assert(summary.averageScore === "80.1", "CPAP average score should calculate across seven entries.");
    assert(summary.averageUsage === "5h 14m", "CPAP average usage should calculate across seven entries.");
    assert(summary.averageEventsPerHour === "2.7", "CPAP average AHI should calculate across seven entries.");
    assert(summary.compliance.percent === "71%", "CPAP compliance percentage should calculate from compliant nights.");
    assert(summary.compliance.compliantNights === 5, "CPAP compliance should count nights with at least four hours.");
}

function testWeightTrendTracking() {
    const app = createContext();

    app.context.saveMedicalBayLog();
    assert(app.fields.weightCurrent.textContent === "121.3 kg", "Weight dashboard should show current weight.");
    assert(app.fields.weightWeeklyChange.textContent === "--", "Single weight entry should not show weekly change.");
    assert(app.fields.weightHighest.textContent === "121.3 kg", "Single weight entry should show highest weight.");
    assert(app.fields.weightLowest.textContent === "121.3 kg", "Single weight entry should show lowest weight.");
    assert(app.context.formatWeight(121.3) === "121.3 kg", "Weight formatter should include kilograms.");
    assert(app.context.formatWeightChange(-0.8) === "-0.8 kg", "Weight change formatter should show decreases.");
    assert(app.context.formatWeightChange(0.4) === "+0.4 kg", "Weight change formatter should show increases.");
    assert(app.context.getWeightTrendDirection(0.4) === "Increasing", "Weight trend should classify increases.");
    assert(app.context.getWeightTrendDirection(-0.8) === "Decreasing", "Weight trend should classify decreases.");
    assert(app.context.getWeightTrendDirection(0.1) === "Stable", "Weight trend should classify small changes as stable.");

    const weightEntries = [
        { date: "2026-06-28", weight: 120.1, waist: 116, notes: "" },
        { date: "2026-06-21", weight: 121.3, waist: 118, notes: "" },
        { date: "2026-06-14", weight: 121.7, waist: 118.5, notes: "" },
        { date: "2026-06-07", weight: 122.0, waist: 119, notes: "" },
        { date: "2026-05-31", weight: 122.4, waist: 119.5, notes: "" }
    ];
    const summary = app.context.buildWeightTrendSummary(weightEntries);

    assert(summary.weeklyChange === "-1.2 kg", "Weight weekly change should compare latest to previous entry.");
    assert(summary.trendDirection === "Decreasing", "Weight trend direction should derive from weekly change.");
    assert(summary.highest === "122.4 kg", "Weight highest value should calculate across entries.");
    assert(summary.lowest === "120.1 kg", "Weight lowest value should calculate across entries.");
    assert(summary.fourWeekTrend === "Decreasing (-1.9 kg)", "Weight 4-week trend should compare latest to fourth entry.");
    assert(summary.twelveWeekTrend === "Decreasing (-2.3 kg)", "Weight 12-week trend should use available entries when fewer than 12 exist.");
    assert(summary.overallTrend === "Decreasing (-2.3 kg)", "Weight overall trend should calculate across all entries.");
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
    assert(!app.context.isValidBackup({
        version: 1,
        logHistory: [],
        medicalBay: {
            history: [{
                id: "medical-2026-06-04",
                date: "2026-06-04",
                painTypes: [],
                cpap: {
                    date: "2026-06-04",
                    score: "94",
                    usageMinutes: 462,
                    maskSeal: 20,
                    eventsPerHour: 1.1,
                    maskOffCount: 0,
                    notes: ""
                },
                updatedAt: "2026-06-04T00:00:00.000Z"
            }]
        }
    }), "Invalid CPAP backup data should fail validation.");
    assert(!app.context.isValidBackup({
        version: 1,
        logHistory: [],
        medicalBay: {
            history: [{
                id: "medical-2026-06-04",
                date: "2026-06-04",
                painTypes: [],
                weight: {
                    date: "2026-06-04",
                    weight: "121.3",
                    waist: 118,
                    notes: ""
                },
                updatedAt: "2026-06-04T00:00:00.000Z"
            }]
        }
    }), "Invalid weight backup data should fail validation.");
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
    await testVoiceSystemPreferenceGate();
    testVoiceSystemLoadsPersistedPreference();
    testVoiceSystemUnsupportedBrowser();
    testStatusAutoDismissBehavior();
    await testLogHistoryAndBackup();
    await testCommandDeckSync();
    await testHistoryControls();
    await testDownloadAndResetWorkflows();
    await testStardateAutomation();
    await testMedicalBayCoreTracking();
    testMedicalBayHistoryShowAllToggle();
    testComputerCoreLocalQueries();
    testMedicalBayZeroMetricRendering();
    testCpapComplianceMonitoring();
    testWeightTrendTracking();
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
