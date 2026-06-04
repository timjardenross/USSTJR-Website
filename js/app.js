const CAPTAINS_LOG_DRAFT_KEY = "usstjr-captains-log-draft";
const LATEST_CAPTAINS_LOG_KEY = "usstjr-latest-captains-log";
const CAPTAINS_LOG_HISTORY_KEY = "usstjr-captains-log-history";
const CAPTAINS_LOG_HISTORY_LIMIT = 20;
const MEDICAL_BAY_DRAFT_KEY = "usstjr-medical-bay-draft";
const MEDICAL_BAY_HISTORY_KEY = "usstjr-medical-bay-history";
const MEDICAL_BAY_HISTORY_LIMIT = 30;
const BACKUP_VERSION = 1;

const CAPTAINS_LOG_FIELD_IDS = [
    "stardateInput",
    "dateInput",
    "mood",
    "energy",
    "pain",
    "stress",
    "wins",
    "challenges",
    "lessons",
    "gratitude",
    "health",
    "career",
    "mindbody",
    "priority1",
    "priority2",
    "priority3",
    "voiceCapture",
    "markdownOutput"
];

const CAPTAINS_LOG_METRIC_FIELDS = [
    {
        id: "mood",
        label: "Mood"
    },
    {
        id: "energy",
        label: "Energy"
    },
    {
        id: "pain",
        label: "Pain"
    },
    {
        id: "stress",
        label: "Stress"
    }
];

const MEDICAL_BAY_FIELD_IDS = [
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
    "medicalSummaryOutput"
];

const MEDICAL_BAY_PAIN_TYPE_IDS = [
    "healthPainTypeBurning",
    "healthPainTypeSharp",
    "healthPainTypeAche",
    "healthPainTypeNerve",
    "healthPainTypeStiffness"
];

const MEDICAL_BAY_METRIC_FIELDS = [
    {
        id: "healthOverallPain",
        label: "Overall pain"
    },
    {
        id: "healthBestPain",
        label: "Best pain"
    },
    {
        id: "healthWorstPain",
        label: "Worst pain"
    },
    {
        id: "healthMood",
        label: "Mood"
    },
    {
        id: "healthAnxiety",
        label: "Anxiety"
    },
    {
        id: "healthStress",
        label: "Stress"
    },
    {
        id: "healthSleepQuality",
        label: "Sleep quality"
    },
    {
        id: "healthEnergy",
        label: "Energy"
    },
    {
        id: "healthFatigue",
        label: "Fatigue"
    }
];

let voiceRecognition = null;
let isVoiceCaptureRunning = false;

function getSpeechRecognitionConstructor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function updateRecordingStatus(message) {
    const statusElement = document.getElementById("recordingStatus");

    if (statusElement) {
        statusElement.textContent = message;
    }
}

function setVoiceCaptureControlsState() {
    const startButton = document.getElementById("startVoiceCaptureButton");
    const stopButton = document.getElementById("stopVoiceCaptureButton");
    const supportMessage = document.getElementById("voiceCaptureSupportMessage");
    const isSupported = Boolean(getSpeechRecognitionConstructor());

    if (startButton) {
        startButton.disabled = !isSupported || isVoiceCaptureRunning;
    }

    if (stopButton) {
        stopButton.disabled = !isSupported || !isVoiceCaptureRunning;
    }

    if (supportMessage) {
        supportMessage.hidden = isSupported;
    }

    if (!isSupported) {
        updateRecordingStatus("Voice capture unavailable");
    }
}

function getVoiceCaptureErrorMessage(errorCode) {
    const messages = {
        "audio-capture": "Microphone unavailable",
        "network": "Speech service unavailable",
        "no-speech": "No speech detected",
        "not-allowed": "Microphone permission denied",
        "service-not-allowed": "Speech service permission denied"
    };

    return messages[errorCode] || `Voice capture error: ${errorCode || "unknown"}`;
}

function showStatus(message, type) {
    const statusElement = document.getElementById("appStatus");

    if (!statusElement) {
        return;
    }

    statusElement.textContent = message;
    statusElement.className = `app-status ${type || "info"}`;
    statusElement.hidden = false;
}

function clearStatus() {
    const statusElement = document.getElementById("appStatus");

    if (statusElement) {
        statusElement.hidden = true;
        statusElement.textContent = "";
        statusElement.className = "app-status";
    }
}

function storageGetItem(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Unable to read localStorage key ${key}:`, error);
        showStatus("Local browser storage is unavailable.", "error");
        return null;
    }
}

function storageSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error(`Unable to write localStorage key ${key}:`, error);
        showStatus("Unable to save data in this browser. Export a backup if possible.", "error");
        return false;
    }
}

function storageRemoveItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Unable to remove localStorage key ${key}:`, error);
        showStatus("Unable to update local browser storage.", "error");
        return false;
    }
}

function storageGetJson(key, fallbackValue) {
    const savedValue = storageGetItem(key);

    if (!savedValue) {
        return fallbackValue;
    }

    try {
        return JSON.parse(savedValue);
    } catch (error) {
        console.error(`Unable to parse localStorage key ${key}:`, error);
        storageRemoveItem(key);
        return fallbackValue;
    }
}

function storageSetJson(key, value) {
    return storageSetItem(key, JSON.stringify(value));
}

function generateStardate() {
    const today = new Date();

    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const dateKey = `${year}${month}${day}`;
    const counterKey = `usstjr-stardate-${dateKey}`;

    const counter = parseInt(storageGetItem(counterKey) || "1", 10);

    return `${dateKey}.${String(counter).padStart(2, "0")}`;
}

function getLocalDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function setTodayDefaults() {
    const today = new Date();

    const dateInput = document.getElementById("dateInput");
    const stardateInput = document.getElementById("stardateInput");

    if (dateInput && !dateInput.value) {
        dateInput.value = getLocalDateInputValue(today);
    }

    if (stardateInput && !stardateInput.value) {
        stardateInput.value = generateStardate();
    }
}

function setMedicalBayDefaults() {
    const dateInput = document.getElementById("healthDateInput");

    if (dateInput && !dateInput.value) {
        dateInput.value = getLocalDateInputValue(new Date());
    }
}

window.addEventListener("DOMContentLoaded", initialiseCaptainsLogPage);

function initialiseCaptainsLogPage() {
    setTodayDefaults();
    setMedicalBayDefaults();
    loadDraft();
    loadMedicalBayDraft();
    loadHistoryEntryFromUrl();
    setupActionHandlers();
    setVoiceCaptureControlsState();
    setupDraftAutosave();
    setupMedicalBayAutosave();
    loadLatestEntryToCommandDeck();
    renderRecentLogsToCommandDeck();
    loadLatestMedicalEntry();
    renderMedicalHistory();
}

function setupActionHandlers() {
    bindClick("startVoiceCaptureButton", startVoiceCapture);
    bindClick("stopVoiceCaptureButton", stopVoiceCapture);
    bindClick("generateLogButton", generateLog);
    bindClick("saveCommandDeckStatusButton", saveCommandDeckStatus);
    bindClick("copyLogButton", copyLog);
    bindClick("downloadLogButton", downloadLog);
    bindClick("resetFormButton", clearDraftAndResetForm);
    bindClick("exportBackupButton", exportBackup);
    bindClick("exportEncryptedBackupButton", exportEncryptedBackup);
    bindClick("clearHistoryButton", clearLogHistory);
    bindClick("saveMedicalLogButton", saveMedicalBayLog);
    bindClick("downloadMedicalLogButton", downloadMedicalBayLog);
    bindClick("resetMedicalLogButton", resetMedicalBayForm);

    const importBackupInput = document.getElementById("importBackupInput");
    const importEncryptedBackupInput = document.getElementById("importEncryptedBackupInput");
    const historySearchInput = document.getElementById("historySearchInput");

    if (importBackupInput) {
        importBackupInput.addEventListener("change", importBackup);
    }

    if (importEncryptedBackupInput) {
        importEncryptedBackupInput.addEventListener("change", importEncryptedBackup);
    }

    if (historySearchInput) {
        historySearchInput.addEventListener("input", renderRecentLogsToCommandDeck);
    }
}

function bindClick(elementId, handler) {
    const element = document.getElementById(elementId);

    if (element) {
        element.addEventListener("click", handler);
    }
}

function confirmAction(message) {
    const modal = document.getElementById("confirmModal");
    const messageElement = document.getElementById("confirmModalMessage");
    const confirmButton = document.getElementById("confirmModalConfirmButton");
    const cancelButton = document.getElementById("confirmModalCancelButton");

    if (!modal || !messageElement || !confirmButton || !cancelButton) {
        return Promise.resolve(confirm(message));
    }

    messageElement.textContent = message;
    modal.hidden = false;
    confirmButton.focus();

    return new Promise(function (resolve) {
        function close(result) {
            modal.hidden = true;
            confirmButton.removeEventListener("click", confirmHandler);
            cancelButton.removeEventListener("click", cancelHandler);
            modal.removeEventListener("keydown", keydownHandler);
            resolve(result);
        }

        function confirmHandler() {
            close(true);
        }

        function cancelHandler() {
            close(false);
        }

        function keydownHandler(event) {
            if (event.key === "Escape") {
                close(false);
            }
        }

        confirmButton.addEventListener("click", confirmHandler);
        cancelButton.addEventListener("click", cancelHandler);
        modal.addEventListener("keydown", keydownHandler);
    });
}

function getDraftData() {
    const draft = {};

    CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            draft[fieldId] = field.value;
        }
    });

    return draft;
}

function saveDraft() {
    const draft = getDraftData();
    storageSetJson(CAPTAINS_LOG_DRAFT_KEY, draft);
}

function loadDraft() {
    const draft = storageGetJson(CAPTAINS_LOG_DRAFT_KEY, null);

    if (!draft) {
        return;
    }

    CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field && draft[fieldId] !== undefined) {
            field.value = draft[fieldId];
        }
    });
}

function setupDraftAutosave() {
    CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            field.addEventListener("input", saveDraft);
            field.addEventListener("change", saveDraft);
        }
    });
}

function clearDraft() {
    storageRemoveItem(CAPTAINS_LOG_DRAFT_KEY);
}

function getMedicalBayDraftData() {
    const draft = {};

    MEDICAL_BAY_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            draft[fieldId] = field.value;
        }
    });

    draft.painTypes = getSelectedMedicalPainTypes();
    return draft;
}

function saveMedicalBayDraft() {
    const draft = getMedicalBayDraftData();
    storageSetJson(MEDICAL_BAY_DRAFT_KEY, draft);
}

function loadMedicalBayDraft() {
    const draft = storageGetJson(MEDICAL_BAY_DRAFT_KEY, null);

    if (!draft) {
        return;
    }

    MEDICAL_BAY_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field && draft[fieldId] !== undefined) {
            field.value = draft[fieldId];
        }
    });

    setSelectedMedicalPainTypes(draft.painTypes || []);
}

function setupMedicalBayAutosave() {
    MEDICAL_BAY_FIELD_IDS.concat(MEDICAL_BAY_PAIN_TYPE_IDS).forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            field.addEventListener("input", saveMedicalBayDraft);
            field.addEventListener("change", saveMedicalBayDraft);
        }
    });
}

async function resetMedicalBayForm() {
    const confirmClear = await confirmAction("Clear this Medical Bay draft?");

    if (!confirmClear) {
        return;
    }

    storageRemoveItem(MEDICAL_BAY_DRAFT_KEY);
    MEDICAL_BAY_FIELD_IDS.forEach(function (fieldId) {
        setFieldValue(fieldId, "");
    });
    setSelectedMedicalPainTypes([]);
    setMedicalBayDefaults();
    showStatus("Medical Bay draft reset.", "success");
}

async function clearDraftAndResetForm() {
    const confirmClear = await confirmAction("Clear this Captain's Log draft?");

    if (!confirmClear) {
        return;
    }

    clearDraft();
    resetFormFields();
    setTodayDefaults();
    showStatus("Captain's Log draft reset.", "success");
}

function resetFormFields() {
    CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            field.value = "";
        }
    });
}

function generateLog() {
    if (!validateMetricInputs()) {
        return;
    }

    setMarkdownOutput(buildCaptainLogMarkdown(getCaptainLogData()));
    saveDraft();
}

function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value : "";
}

function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);

    if (field) {
        field.value = value || "";
    }
}

function getCaptainLogData() {
    return {
        stardateInput: getFieldValue("stardateInput"),
        dateInput: getFieldValue("dateInput"),
        mood: getFieldValue("mood"),
        energy: getFieldValue("energy"),
        pain: getFieldValue("pain"),
        stress: getFieldValue("stress"),
        wins: getFieldValue("wins"),
        challenges: getFieldValue("challenges"),
        lessons: getFieldValue("lessons"),
        gratitude: getFieldValue("gratitude"),
        health: getFieldValue("health"),
        career: getFieldValue("career"),
        mindbody: getFieldValue("mindbody"),
        priority1: getFieldValue("priority1"),
        priority2: getFieldValue("priority2"),
        priority3: getFieldValue("priority3"),
        voiceCapture: getFieldValue("voiceCapture"),
        markdownOutput: getFieldValue("markdownOutput")
    };
}

function getMedicalBayData() {
    return {
        date: getFieldValue("healthDateInput"),
        overallPain: getFieldValue("healthOverallPain"),
        bestPain: getFieldValue("healthBestPain"),
        worstPain: getFieldValue("healthWorstPain"),
        painLocation: getFieldValue("healthPainLocation"),
        painTypes: getSelectedMedicalPainTypes(),
        mood: getFieldValue("healthMood"),
        anxiety: getFieldValue("healthAnxiety"),
        stress: getFieldValue("healthStress"),
        sleepHours: getFieldValue("healthSleepHours"),
        sleepQuality: getFieldValue("healthSleepQuality"),
        wakeups: getFieldValue("healthWakeups"),
        energy: getFieldValue("healthEnergy"),
        fatigue: getFieldValue("healthFatigue"),
        observations: getFieldValue("healthObservations"),
        activities: getFieldValue("healthActivities"),
        triggers: getFieldValue("healthTriggers"),
        wins: getFieldValue("healthWins"),
        challenges: getFieldValue("healthChallenges"),
        summaryOutput: getFieldValue("medicalSummaryOutput")
    };
}

function getSelectedMedicalPainTypes() {
    return MEDICAL_BAY_PAIN_TYPE_IDS.map(function (fieldId) {
        const field = document.getElementById(fieldId);
        return field && field.checked ? field.value : "";
    }).filter(Boolean);
}

function setSelectedMedicalPainTypes(painTypes) {
    MEDICAL_BAY_PAIN_TYPE_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            field.checked = painTypes.indexOf(field.value) !== -1;
        }
    });
}

function buildCaptainLogMarkdown(data) {
    return `# Stardate ${data.stardateInput}

Date: ${data.dateInput}

## Status

Mood: ${data.mood}
Energy: ${data.energy}
Pain: ${data.pain}
Stress: ${data.stress}

## Today's Wins

${data.wins}

## Challenges

${data.challenges}

## Lessons Learned

${data.lessons}

## Gratitude

${data.gratitude}

## Mission Progress

### Health

${data.health}

### Career

${data.career}

### TJR Mind Body

${data.mindbody}

## Raw Voice Reflection

${data.voiceCapture}

## Tomorrow's Priorities

1. ${data.priority1}
2. ${data.priority2}
3. ${data.priority3}
`;
}

function buildMedicalBayMarkdown(data, trendSummary) {
    return `# Medical Bay Health Log

Date: ${data.date}

## Pain

Overall pain: ${data.overallPain}
Best pain today: ${data.bestPain}
Worst pain today: ${data.worstPain}
Pain location: ${data.painLocation}
Pain type: ${data.painTypes.length ? data.painTypes.join(", ") : "Not recorded"}

## Mood

Mood: ${data.mood}
Anxiety: ${data.anxiety}
Stress: ${data.stress}

## Sleep

Hours slept: ${data.sleepHours}
Sleep quality: ${data.sleepQuality}
Overnight wake-ups: ${data.wakeups}

## Energy

Energy: ${data.energy}
Fatigue: ${data.fatigue}

## Daily Notes

### Observations

${data.observations}

### Activities

${data.activities}

### Triggers

${data.triggers}

### Wins

${data.wins}

### Challenges

${data.challenges}

## Health Intelligence

${trendSummary}
`;
}

function buildMedicalTrendSummary(data) {
    const history = getMedicalBayHistory();
    const recentEntries = history.slice(0, 7);
    const previousPainAverage = averageNumericValues(recentEntries.map(function (entry) {
        return entry.overallPain;
    }));
    const previousSleepAverage = averageNumericValues(recentEntries.map(function (entry) {
        return entry.sleepHours;
    }));
    const lines = [
        `Current pain is ${data.overallPain || "--"} with worst pain ${data.worstPain || "--"}.`,
        `Sleep was ${data.sleepHours || "--"} hours at quality ${data.sleepQuality || "--"}.`,
        `Energy is ${data.energy || "--"} and fatigue is ${data.fatigue || "--"}.`
    ];

    if (previousPainAverage !== null) {
        lines.push(`Previous ${recentEntries.length}-log average pain was ${previousPainAverage}.`);
    }

    if (previousSleepAverage !== null) {
        lines.push(`Previous ${recentEntries.length}-log average sleep was ${previousSleepAverage} hours.`);
    }

    if (data.triggers) {
        lines.push(`Watch trigger pattern: ${data.triggers}`);
    }

    return lines.join("\n");
}

function averageNumericValues(values) {
    const numericValues = values.map(Number).filter(function (value) {
        return Number.isFinite(value);
    });

    if (numericValues.length === 0) {
        return null;
    }

    const total = numericValues.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    return (total / numericValues.length).toFixed(1);
}

function setMarkdownOutput(markdown) {
    const markdownOutput = document.getElementById("markdownOutput");

    if (markdownOutput) {
        markdownOutput.value = markdown;
    }
}

function validateMetricInputs() {
    for (let i = 0; i < CAPTAINS_LOG_METRIC_FIELDS.length; i++) {
        const metric = CAPTAINS_LOG_METRIC_FIELDS[i];
        const field = document.getElementById(metric.id);

        if (!field) {
            continue;
        }

        const value = field.value.trim();
        const numericValue = Number(value);

        if (value === "" || !Number.isFinite(numericValue) || numericValue < 0 || numericValue > 10) {
            showStatus(`${metric.label} must be a number from 0 to 10.`, "error");
            field.focus();
            return false;
        }
    }

    return true;
}

function validateMedicalBayInputs() {
    for (let i = 0; i < MEDICAL_BAY_METRIC_FIELDS.length; i++) {
        const metric = MEDICAL_BAY_METRIC_FIELDS[i];
        const field = document.getElementById(metric.id);

        if (!field || field.value.trim() === "") {
            continue;
        }

        const numericValue = Number(field.value);

        if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 10) {
            showStatus(`${metric.label} must be a number from 0 to 10.`, "error");
            field.focus();
            return false;
        }
    }

    const sleepHours = document.getElementById("healthSleepHours");
    const wakeups = document.getElementById("healthWakeups");

    if (sleepHours && sleepHours.value.trim() !== "" && (Number(sleepHours.value) < 0 || Number(sleepHours.value) > 24)) {
        showStatus("Hours slept must be between 0 and 24.", "error");
        sleepHours.focus();
        return false;
    }

    if (wakeups && wakeups.value.trim() !== "" && Number(wakeups.value) < 0) {
        showStatus("Overnight wake-ups must be 0 or higher.", "error");
        wakeups.focus();
        return false;
    }

    return true;
}

function saveMedicalBayLog() {
    if (!validateMedicalBayInputs()) {
        return;
    }

    const data = getMedicalBayData();

    if (!data.date) {
        showStatus("Medical Bay log date is required.", "error");
        const dateInput = document.getElementById("healthDateInput");

        if (dateInput) {
            dateInput.focus();
        }
        return;
    }

    const summary = buildMedicalTrendSummary(data);
    const markdown = buildMedicalBayMarkdown(data, summary);

    setFieldValue("medicalSummaryOutput", markdown);
    data.summaryOutput = markdown;
    saveMedicalBayHistoryEntry(data);
    saveMedicalBayDraft();
    loadLatestMedicalEntry();
    renderMedicalHistory();
    showStatus("Medical Bay health log saved.", "success");
}

function downloadMedicalBayLog() {
    const markdown = getFieldValue("medicalSummaryOutput");

    if (!markdown) {
        showStatus("Save a Medical Bay health log first.", "error");
        return;
    }

    const date = getFieldValue("healthDateInput") || "undated";
    downloadTextFile(`${date}-Medical-Bay.md`, markdown, "text/markdown");
}

function saveCommandDeckStatus() {
    if (!validateMetricInputs()) {
        return;
    }

    const logData = getCaptainLogData();
    const markdown = logData.markdownOutput || buildCaptainLogMarkdown(logData);
    const stardate = logData.stardateInput;
    const date = logData.dateInput;
    const latestEntry = getLatestEntry();
    const historyEntryExists = getLogHistory().some(function (entry) {
        return entry.id === createLogHistoryEntryId(stardate, date);
    });

    setMarkdownOutput(markdown);
    logData.markdownOutput = markdown;

    saveLatestEntry({
        stardate: stardate,
        date: date,
        mood: logData.mood,
        energy: logData.energy,
        pain: logData.pain,
        stress: logData.stress
    });

    saveLogHistoryEntry(logData, markdown);
    loadLatestEntryToCommandDeck();
    renderRecentLogsToCommandDeck();

    if ((!latestEntry || latestEntry.stardate !== stardate) && !historyEntryExists) {
        advanceStardateCounter(stardate);
    }

    saveDraft();
    showStatus("Command Deck status and log history saved.", "success");
}

function copyLog() {
    const output = document.getElementById("markdownOutput");

    if (!output || !output.value) {
        showStatus("Generate a Captain's Log first.", "error");
        return;
    }

    output.select();
    output.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(output.value)
        .then(function () {
            showStatus("Captain's Log copied to clipboard.", "success");
        })
        .catch(function () {
            showStatus("Unable to copy Captain's Log. Please copy manually.", "error");
        });
}

function downloadLog() {
    const markdown = getFieldValue("markdownOutput");

    if (!markdown) {
        showStatus("Generate a Captain's Log first.", "error");
        return;
    }

    if (!validateMetricInputs()) {
        return;
    }

    const stardate = getFieldValue("stardateInput");
    const date = getFieldValue("dateInput");

    const filename = `${date}-Stardate-${stardate}.md`;

    downloadTextFile(filename, markdown, "text/markdown");
}

function startVoiceCapture() {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    const voiceCapture = document.getElementById("voiceCapture");

    if (!SpeechRecognition) {
        updateRecordingStatus("Voice capture unavailable");
        setVoiceCaptureControlsState();
        return;
    }

    if (!voiceCapture) {
        updateRecordingStatus("Voice transcript field unavailable");
        return;
    }

    if (isVoiceCaptureRunning && voiceRecognition) {
        setVoiceCaptureControlsState();
        return;
    }

    voiceRecognition = new SpeechRecognition();
    voiceRecognition.continuous = true;
    voiceRecognition.interimResults = true;
    voiceRecognition.lang = "en-AU";

    let finalTranscript = voiceCapture.value ? `${voiceCapture.value} ` : "";

    voiceRecognition.onresult = function (event) {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += `${transcript} `;
            } else {
                interimTranscript += transcript;
            }
        }

        voiceCapture.value = `${finalTranscript}${interimTranscript}`.trim();
        saveDraft();
    };

    voiceRecognition.onerror = function (event) {
        updateRecordingStatus(getVoiceCaptureErrorMessage(event.error));
        isVoiceCaptureRunning = false;
        setVoiceCaptureControlsState();
        saveDraft();
    };

    voiceRecognition.onend = function () {
        isVoiceCaptureRunning = false;
        updateRecordingStatus("Recording stopped");
        setVoiceCaptureControlsState();
        saveDraft();
    };

    try {
        voiceRecognition.start();
        isVoiceCaptureRunning = true;
        updateRecordingStatus("Recording");
        setVoiceCaptureControlsState();
    } catch (error) {
        console.error("Unable to start voice capture:", error);
        isVoiceCaptureRunning = false;
        updateRecordingStatus("Unable to start voice capture");
        setVoiceCaptureControlsState();
    }
}

function stopVoiceCapture() {
    if (voiceRecognition && isVoiceCaptureRunning) {
        voiceRecognition.stop();
        isVoiceCaptureRunning = false;
        updateRecordingStatus("Recording stopped");
        setVoiceCaptureControlsState();
        saveDraft();
    }
}

function saveLatestEntry(entry) {
    storageSetJson(LATEST_CAPTAINS_LOG_KEY, entry);
}

function buildBackup() {
    return {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        latestEntry: getLatestEntry(),
        logHistory: getLogHistory(),
        draft: getSavedDraft(),
        medicalBay: {
            history: getMedicalBayHistory(),
            draft: getSavedMedicalBayDraft()
        },
        stardateCounters: getStardateCounters()
    };
}

function exportBackup() {
    const backup = buildBackup();
    const filename = `usstjr-backup-${getLocalDateInputValue(new Date())}.json`;

    downloadTextFile(filename, JSON.stringify(backup, null, 2), "application/json");
    showStatus("Backup exported.", "success");
}

function importBackup(event) {
    const fileInput = event.target;
    const file = fileInput.files && fileInput.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = async function () {
        try {
            if (await restoreBackup(JSON.parse(String(reader.result || "{}")))) {
                showStatus("Backup imported.", "success");
            }
        } catch (error) {
            console.error("Unable to import backup:", error);
            showStatus("Unable to import backup. Check that the file is a USS TJR JSON backup.", "error");
        } finally {
            fileInput.value = "";
        }
    };

    reader.onerror = function () {
        showStatus("Unable to read backup file.", "error");
        fileInput.value = "";
    };

    reader.readAsText(file);
}

async function exportEncryptedBackup() {
    const passphrase = getBackupPassphrase();

    if (!passphrase) {
        showStatus("Enter a backup passphrase before exporting an encrypted backup.", "error");
        return;
    }

    if (!hasCryptoSupport()) {
        showStatus("Encrypted backup is unavailable in this browser.", "error");
        return;
    }

    const encryptedBackup = await encryptBackup(buildBackup(), passphrase);
    const filename = `usstjr-encrypted-backup-${getLocalDateInputValue(new Date())}.json`;

    downloadTextFile(filename, JSON.stringify(encryptedBackup, null, 2), "application/json");
    showStatus("Encrypted backup exported.", "success");
}

function importEncryptedBackup(event) {
    const fileInput = event.target;
    const file = fileInput.files && fileInput.files[0];
    const passphrase = getBackupPassphrase();

    if (!file) {
        return;
    }

    if (!passphrase) {
        showStatus("Enter the backup passphrase before importing an encrypted backup.", "error");
        fileInput.value = "";
        return;
    }

    if (!hasCryptoSupport()) {
        showStatus("Encrypted backup is unavailable in this browser.", "error");
        fileInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = async function () {
        try {
            const encryptedBackup = JSON.parse(String(reader.result || "{}"));
            const backup = await decryptBackup(encryptedBackup, passphrase);

            if (await restoreBackup(backup)) {
                showStatus("Encrypted backup imported.", "success");
            }
        } catch (error) {
            console.error("Unable to import encrypted backup:", error);
            showStatus("Unable to import encrypted backup. Check the file and passphrase.", "error");
        } finally {
            fileInput.value = "";
        }
    };

    reader.onerror = function () {
        showStatus("Unable to read encrypted backup file.", "error");
        fileInput.value = "";
    };

    reader.readAsText(file);
}

async function restoreBackup(backup) {
    if (!isValidBackup(backup)) {
        throw new Error("Invalid backup format.");
    }

    const confirmImport = await confirmAction("Importing this backup will replace current USS TJR local data in this browser.");

    if (!confirmImport) {
        return false;
    }

    if (backup.latestEntry) {
        saveLatestEntry(backup.latestEntry);
    } else {
        storageRemoveItem(LATEST_CAPTAINS_LOG_KEY);
    }

    saveLogHistory(backup.logHistory);
    restoreDraft(backup.draft);
    restoreMedicalBayData(backup.medicalBay);
    restoreStardateCounters(backup.stardateCounters || {});
    loadLatestEntryToCommandDeck();
    renderRecentLogsToCommandDeck();
    loadLatestMedicalEntry();
    renderMedicalHistory();

    return true;
}

function getBackupPassphrase() {
    return getFieldValue("backupPassphraseInput");
}

function hasCryptoSupport() {
    return Boolean(window.crypto && window.crypto.subtle && window.crypto.getRandomValues);
}

async function encryptBackup(backup, passphrase) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveEncryptionKey(passphrase, salt);
    const encodedBackup = new TextEncoder().encode(JSON.stringify(backup));
    const cipherBytes = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encodedBackup
    );

    return {
        encrypted: true,
        version: BACKUP_VERSION,
        algorithm: "AES-GCM",
        keyDerivation: "PBKDF2-SHA-256",
        iterations: 150000,
        exportedAt: new Date().toISOString(),
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
        data: bytesToBase64(new Uint8Array(cipherBytes))
    };
}

async function decryptBackup(encryptedBackup, passphrase) {
    if (!encryptedBackup || encryptedBackup.encrypted !== true || encryptedBackup.version !== BACKUP_VERSION) {
        throw new Error("Invalid encrypted backup format.");
    }

    const salt = base64ToBytes(encryptedBackup.salt);
    const iv = base64ToBytes(encryptedBackup.iv);
    const cipherBytes = base64ToBytes(encryptedBackup.data);
    const key = await deriveEncryptionKey(passphrase, salt);
    const plainBytes = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        cipherBytes
    );

    return JSON.parse(new TextDecoder().decode(plainBytes));
}

async function deriveEncryptionKey(passphrase, salt) {
    const baseKey = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 150000,
            hash: "SHA-256"
        },
        baseKey,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ["encrypt", "decrypt"]
    );
}

function bytesToBase64(bytes) {
    let binary = "";

    bytes.forEach(function (byte) {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}

function base64ToBytes(value) {
    return Uint8Array.from(atob(value), function (character) {
        return character.charCodeAt(0);
    });
}

function isValidBackup(backup) {
    if (!backup || backup.version !== BACKUP_VERSION || !Array.isArray(backup.logHistory)) {
        return false;
    }

    if (backup.latestEntry && !isValidLatestEntry(backup.latestEntry)) {
        return false;
    }

    if (backup.draft && !isPlainObject(backup.draft)) {
        return false;
    }

    if (backup.stardateCounters && !isValidStardateCounters(backup.stardateCounters)) {
        return false;
    }

    if (backup.medicalBay && !isValidMedicalBayBackup(backup.medicalBay)) {
        return false;
    }

    return backup.logHistory.every(isValidHistoryEntry);
}

function isValidLatestEntry(entry) {
    return isPlainObject(entry)
        && isStringValue(entry.stardate)
        && isStringValue(entry.date)
        && isStringValue(entry.mood)
        && isStringValue(entry.energy)
        && isStringValue(entry.pain)
        && isStringValue(entry.stress);
}

function isValidHistoryEntry(entry) {
    return isPlainObject(entry)
        && isStringValue(entry.id)
        && isStringValue(entry.stardate)
        && isStringValue(entry.date)
        && isStringValue(entry.markdown)
        && isPlainObject(entry.fields)
        && isStringValue(entry.updatedAt);
}

function isValidStardateCounters(counters) {
    return isPlainObject(counters) && Object.keys(counters).every(function (key) {
        return key.indexOf("usstjr-stardate-") === 0 && isStringValue(String(counters[key]));
    });
}

function isValidMedicalBayBackup(medicalBay) {
    return isPlainObject(medicalBay)
        && Array.isArray(medicalBay.history)
        && (!medicalBay.draft || isPlainObject(medicalBay.draft))
        && medicalBay.history.every(isValidMedicalBayEntry);
}

function isValidMedicalBayEntry(entry) {
    return isPlainObject(entry)
        && isStringValue(entry.id)
        && isStringValue(entry.date)
        && Array.isArray(entry.painTypes)
        && isStringValue(entry.updatedAt);
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringValue(value) {
    return typeof value === "string";
}

function getSavedDraft() {
    return storageGetJson(CAPTAINS_LOG_DRAFT_KEY, null);
}

function getSavedMedicalBayDraft() {
    return storageGetJson(MEDICAL_BAY_DRAFT_KEY, null);
}

function restoreDraft(draft) {
    if (draft) {
        storageSetJson(CAPTAINS_LOG_DRAFT_KEY, draft);
    } else {
        storageRemoveItem(CAPTAINS_LOG_DRAFT_KEY);
    }
}

function restoreMedicalBayData(medicalBay) {
    if (!medicalBay) {
        saveMedicalBayHistory([]);
        storageRemoveItem(MEDICAL_BAY_DRAFT_KEY);
        return;
    }

    saveMedicalBayHistory(medicalBay.history || []);

    if (medicalBay.draft) {
        storageSetJson(MEDICAL_BAY_DRAFT_KEY, medicalBay.draft);
    } else {
        storageRemoveItem(MEDICAL_BAY_DRAFT_KEY);
    }
}

function getStardateCounters() {
    const counters = {};

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key && key.indexOf("usstjr-stardate-") === 0) {
                counters[key] = storageGetItem(key);
            }
        }
    } catch (error) {
        console.error("Unable to read stardate counters:", error);
        showStatus("Unable to read stardate counters from local storage.", "error");
    }

    return counters;
}

function restoreStardateCounters(counters) {
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);

            if (key && key.indexOf("usstjr-stardate-") === 0) {
                storageRemoveItem(key);
            }
        }
    } catch (error) {
        console.error("Unable to clear stardate counters:", error);
        showStatus("Unable to update stardate counters.", "error");
    }

    Object.keys(counters).forEach(function (key) {
        if (key.indexOf("usstjr-stardate-") === 0) {
            storageSetItem(key, String(counters[key]));
        }
    });
}

function downloadTextFile(filename, text, type) {
    const blob = new Blob([text], {
        type: type
    });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}

function getLogHistory() {
    const history = storageGetJson(CAPTAINS_LOG_HISTORY_KEY, []);
    return Array.isArray(history) ? history : [];
}

function getMedicalBayHistory() {
    const history = storageGetJson(MEDICAL_BAY_HISTORY_KEY, []);
    return Array.isArray(history) ? history : [];
}

function saveLogHistory(history) {
    storageSetJson(CAPTAINS_LOG_HISTORY_KEY, history);
}

function saveMedicalBayHistory(history) {
    storageSetJson(MEDICAL_BAY_HISTORY_KEY, history);
}

function saveLogHistoryEntry(logData, markdown) {
    const now = new Date().toISOString();
    const entryId = createLogHistoryEntryId(logData.stardateInput, logData.dateInput);
    const history = getLogHistory();
    const existingEntry = history.find(function (entry) {
        return entry.id === entryId;
    });

    const nextEntry = {
        id: entryId,
        stardate: logData.stardateInput,
        date: logData.dateInput,
        mood: logData.mood,
        energy: logData.energy,
        pain: logData.pain,
        stress: logData.stress,
        fields: logData,
        markdown: markdown,
        createdAt: existingEntry ? existingEntry.createdAt : now,
        updatedAt: now
    };

    const nextHistory = history
        .filter(function (entry) {
            return entry.id !== entryId;
        })
        .concat(nextEntry)
        .sort(function (a, b) {
            return String(b.updatedAt).localeCompare(String(a.updatedAt));
        })
        .slice(0, CAPTAINS_LOG_HISTORY_LIMIT);

    saveLogHistory(nextHistory);
}

function createLogHistoryEntryId(stardate, date) {
    return `${date || "undated"}-${stardate || "unstardated"}`
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-");
}

function saveMedicalBayHistoryEntry(data) {
    const now = new Date().toISOString();
    const entryId = createMedicalBayEntryId(data.date);
    const history = getMedicalBayHistory();
    const existingEntry = history.find(function (entry) {
        return entry.id === entryId;
    });
    const nextEntry = Object.assign({}, data, {
        id: entryId,
        createdAt: existingEntry ? existingEntry.createdAt : now,
        updatedAt: now
    });
    const nextHistory = history
        .filter(function (entry) {
            return entry.id !== entryId;
        })
        .concat(nextEntry)
        .sort(function (a, b) {
            return String(b.date).localeCompare(String(a.date)) || String(b.updatedAt).localeCompare(String(a.updatedAt));
        })
        .slice(0, MEDICAL_BAY_HISTORY_LIMIT);

    saveMedicalBayHistory(nextHistory);
}

function createMedicalBayEntryId(date) {
    return `medical-${date || "undated"}`
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-");
}

function getLatestEntry() {
    return storageGetJson(LATEST_CAPTAINS_LOG_KEY, null);
}

function advanceStardateCounter(stardate) {
    const dateKey = stardate.split(".")[0];

    if (!dateKey) {
        return;
    }

    const counterKey = `usstjr-stardate-${dateKey}`;
    const currentCounter = parseInt(storageGetItem(counterKey) || "1", 10);

    storageSetItem(counterKey, String(currentCounter + 1));
}

function loadLatestEntryToCommandDeck() {
    const entry = getLatestEntry();

    if (!entry) {
        setTextContent("commandStardate", "--");
        setTextContent("commandMood", "--");
        setTextContent("commandEnergy", "--");
        setTextContent("commandPain", "--");
        setTextContent("commandStress", "--");

        setTextContent("latestEntryStardate", "No entry recorded yet");
        setTextContent("latestMood", "--");
        setTextContent("latestEnergy", "--");
        setTextContent("latestPain", "--");
        setTextContent("latestStress", "--");
        return;
    }

    setTextContent("commandStardate", entry.stardate || "--");
    setTextContent("commandMood", entry.mood || "--");
    setTextContent("commandEnergy", entry.energy || "--");
    setTextContent("commandPain", entry.pain || "--");
    setTextContent("commandStress", entry.stress || "--");

    setTextContent("latestEntryStardate", entry.stardate || "No entry recorded yet");
    setTextContent("latestMood", entry.mood || "--");
    setTextContent("latestEnergy", entry.energy || "--");
    setTextContent("latestPain", entry.pain || "--");
    setTextContent("latestStress", entry.stress || "--");
}

function loadLatestMedicalEntry() {
    const history = getMedicalBayHistory();
    const latestEntry = history[0];

    if (!document.getElementById("medicalLatestDate")) {
        return;
    }

    if (!latestEntry) {
        setTextContent("medicalLatestDate", "No health log recorded yet");
        setTextContent("medicalLatestPain", "--");
        setTextContent("medicalLatestSleep", "--");
        setTextContent("medicalLatestEnergy", "--");
        setTextContent("medicalLatestStress", "--");
        return;
    }

    setTextContent("medicalLatestDate", latestEntry.date || "No health log recorded yet");
    setTextContent("medicalLatestPain", latestEntry.overallPain || "--");
    setTextContent("medicalLatestSleep", latestEntry.sleepHours || "--");
    setTextContent("medicalLatestEnergy", latestEntry.energy || "--");
    setTextContent("medicalLatestStress", latestEntry.stress || "--");
}

function renderMedicalHistory() {
    const medicalHistoryList = document.getElementById("medicalHistoryList");

    if (!medicalHistoryList) {
        return;
    }

    const history = getMedicalBayHistory();
    medicalHistoryList.textContent = "";

    if (history.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No health logs yet.";
        medicalHistoryList.appendChild(emptyMessage);
        return;
    }

    history.slice(0, 5).forEach(function (entry) {
        const item = document.createElement("article");
        const title = document.createElement("h3");
        const metrics = document.createElement("p");
        const notes = document.createElement("p");

        item.className = "history-entry";
        title.textContent = entry.date || "Undated health log";
        metrics.textContent = `Pain ${entry.overallPain || "--"} · Sleep ${entry.sleepHours || "--"}h · Energy ${entry.energy || "--"} · Stress ${entry.stress || "--"}`;
        notes.textContent = entry.triggers ? `Triggers: ${entry.triggers}` : "No triggers recorded.";

        item.appendChild(title);
        item.appendChild(metrics);
        item.appendChild(notes);
        medicalHistoryList.appendChild(item);
    });
}

function renderRecentLogsToCommandDeck() {
    const recentLogsList = document.getElementById("recentLogsList");
    const historySearchInput = document.getElementById("historySearchInput");

    if (!recentLogsList) {
        return;
    }

    const history = getLogHistory();
    const searchTerm = historySearchInput ? historySearchInput.value.trim().toLowerCase() : "";
    const filteredHistory = searchTerm
        ? history.filter(function (entry) {
            return getHistoryEntrySearchText(entry).indexOf(searchTerm) !== -1;
        })
        : history;

    recentLogsList.textContent = "";

    if (history.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No saved logs yet.";
        recentLogsList.appendChild(emptyMessage);
        return;
    }

    if (filteredHistory.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No logs match that search.";
        recentLogsList.appendChild(emptyMessage);
        return;
    }

    filteredHistory.slice(0, 5).forEach(function (entry) {
        const item = document.createElement("article");
        const title = document.createElement("h3");
        const meta = document.createElement("p");
        const metrics = document.createElement("p");
        const actions = document.createElement("div");
        const restoreLink = document.createElement("a");
        const downloadButton = document.createElement("button");
        const deleteButton = document.createElement("button");

        item.className = "history-entry";
        actions.className = "history-actions";
        title.textContent = `Stardate ${entry.stardate || "--"}`;
        meta.textContent = entry.date || "No date recorded";
        metrics.textContent = `Mood ${entry.mood || "--"} · Energy ${entry.energy || "--"} · Pain ${entry.pain || "--"} · Stress ${entry.stress || "--"}`;
        restoreLink.className = "button secondary-button compact-button";
        restoreLink.href = `captains-log.html?log=${encodeURIComponent(entry.id)}`;
        restoreLink.textContent = "Open Log";
        downloadButton.className = "button compact-button";
        downloadButton.type = "button";
        downloadButton.textContent = "Download";
        downloadButton.addEventListener("click", function () {
            downloadHistoryEntry(entry.id);
        });
        deleteButton.className = "button secondary-button compact-button";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteHistoryEntry(entry.id);
        });

        item.appendChild(title);
        item.appendChild(meta);
        item.appendChild(metrics);
        actions.appendChild(restoreLink);
        actions.appendChild(downloadButton);
        actions.appendChild(deleteButton);
        item.appendChild(actions);
        recentLogsList.appendChild(item);
    });
}

function getHistoryEntrySearchText(entry) {
    return [
        entry.stardate,
        entry.date,
        entry.mood,
        entry.energy,
        entry.pain,
        entry.stress,
        entry.markdown
    ].join(" ").toLowerCase();
}

function downloadHistoryEntry(entryId) {
    const entry = getLogHistory().find(function (historyEntry) {
        return historyEntry.id === entryId;
    });

    if (!entry) {
        showStatus("Unable to find that saved log.", "error");
        return;
    }

    const filename = `${entry.date || "undated"}-Stardate-${entry.stardate || "unknown"}.md`;
    downloadTextFile(filename, entry.markdown || "", "text/markdown");
    showStatus("Saved log downloaded.", "success");
}

async function deleteHistoryEntry(entryId) {
    const confirmDelete = await confirmAction("Delete this saved Captain's Log entry?");

    if (!confirmDelete) {
        return;
    }

    const latestEntry = getLatestEntry();
    const nextHistory = getLogHistory().filter(function (entry) {
        return entry.id !== entryId;
    });
    const deletedLatestEntry = latestEntry && createLogHistoryEntryId(latestEntry.stardate, latestEntry.date) === entryId;

    saveLogHistory(nextHistory);
    if (deletedLatestEntry && nextHistory.length > 0) {
        saveLatestEntry({
            stardate: nextHistory[0].stardate,
            date: nextHistory[0].date,
            mood: nextHistory[0].mood,
            energy: nextHistory[0].energy,
            pain: nextHistory[0].pain,
            stress: nextHistory[0].stress
        });
    } else if (deletedLatestEntry) {
        storageRemoveItem(LATEST_CAPTAINS_LOG_KEY);
    }
    loadLatestEntryToCommandDeck();
    renderRecentLogsToCommandDeck();
    showStatus("Saved log deleted.", "success");
}

async function clearLogHistory() {
    const confirmClear = await confirmAction("Clear all saved Captain's Log history?");

    if (!confirmClear) {
        return;
    }

    saveLogHistory([]);
    storageRemoveItem(LATEST_CAPTAINS_LOG_KEY);
    loadLatestEntryToCommandDeck();
    renderRecentLogsToCommandDeck();
    showStatus("Captain's Log history cleared.", "success");
}

function loadHistoryEntryFromUrl() {
    const stardateInput = document.getElementById("stardateInput");

    if (!stardateInput) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const logId = params.get("log");

    if (!logId) {
        return;
    }

    const entry = getLogHistory().find(function (historyEntry) {
        return historyEntry.id === logId;
    });

    if (!entry || !entry.fields) {
        showStatus("Unable to load that Captain's Log entry.", "error");
        return;
    }

    CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
        setFieldValue(fieldId, entry.fields[fieldId]);
    });

    setMarkdownOutput(entry.markdown || entry.fields.markdownOutput || "");
    saveDraft();
}

function setTextContent(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}
