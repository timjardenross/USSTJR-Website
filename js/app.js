const CAPTAINS_LOG_DRAFT_KEY = "usstjr-captains-log-draft";
const LATEST_CAPTAINS_LOG_KEY = "usstjr-latest-captains-log";
const CAPTAINS_LOG_HISTORY_KEY = "usstjr-captains-log-history";
const CAPTAINS_LOG_HISTORY_LIMIT = 20;

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

let voiceRecognition = null;
let isVoiceCaptureRunning = false;

function updateRecordingStatus(message) {
    const statusElement = document.getElementById("recordingStatus");

    if (statusElement) {
        statusElement.textContent = message;
    }
}

function generateStardate() {
    const today = new Date();

    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const dateKey = `${year}${month}${day}`;
    const counterKey = `usstjr-stardate-${dateKey}`;

    const counter = parseInt(localStorage.getItem(counterKey) || "1", 10);

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

window.addEventListener("DOMContentLoaded", initialiseCaptainsLogPage);

function initialiseCaptainsLogPage() {
    setTodayDefaults();
    loadDraft();
    loadHistoryEntryFromUrl();
    setupDraftAutosave();
    loadLatestEntryToCommandDeck();
    renderRecentLogsToCommandDeck();
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
    localStorage.setItem(CAPTAINS_LOG_DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
    const savedDraft = localStorage.getItem(CAPTAINS_LOG_DRAFT_KEY);

    if (!savedDraft) {
        return;
    }

    try {
        const draft = JSON.parse(savedDraft);

        CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
            const field = document.getElementById(fieldId);

            if (field && draft[fieldId] !== undefined) {
                field.value = draft[fieldId];
            }
        });
    } catch (error) {
        console.error("Unable to load Captain's Log draft:", error);
        clearDraft();
    }
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
    localStorage.removeItem(CAPTAINS_LOG_DRAFT_KEY);
}

function clearDraftAndResetForm() {
    const confirmClear = confirm("Clear this Captain's Log draft?");

    if (!confirmClear) {
        return;
    }

    clearDraft();
    resetFormFields();
    setTodayDefaults();
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
            alert(`${metric.label} must be a number from 0 to 10.`);
            field.focus();
            return false;
        }
    }

    return true;
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

    if ((!latestEntry || latestEntry.stardate !== stardate) && !historyEntryExists) {
        advanceStardateCounter(stardate);
    }

    saveDraft();
    alert("Command Deck status and log history saved.");
}

function copyLog() {
    const output = document.getElementById("markdownOutput");

    if (!output || !output.value) {
        alert("Generate a Captain's Log first.");
        return;
    }

    output.select();
    output.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(output.value)
        .then(function () {
            alert("Captain's Log copied to clipboard.");
        })
        .catch(function () {
            alert("Unable to copy Captain's Log. Please copy manually.");
        });
}

function downloadLog() {
    const markdown = getFieldValue("markdownOutput");

    if (!markdown) {
        alert("Generate a Captain's Log first.");
        return;
    }

    if (!validateMetricInputs()) {
        return;
    }

    const stardate = getFieldValue("stardateInput");
    const date = getFieldValue("dateInput");

    const filename = `${date}-Stardate-${stardate}.md`;

    const blob = new Blob([markdown], {
        type: "text/markdown"
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}

function startVoiceCapture() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceCapture = document.getElementById("voiceCapture");

    if (!SpeechRecognition) {
        alert("Voice capture is not supported in this browser. Try Chrome or Safari with dictation enabled.");
        return;
    }

    if (!voiceCapture) {
        alert("Voice capture field is missing from this page.");
        return;
    }

    if (isVoiceCaptureRunning && voiceRecognition) {
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
        alert(`Voice capture error: ${event.error}`);
        updateRecordingStatus(`⚠️ Voice capture error: ${event.error}`);
        isVoiceCaptureRunning = false;
    };

    voiceRecognition.onend = function () {
        updateRecordingStatus("⚪ Recording stopped");
        isVoiceCaptureRunning = false;
    };

    updateRecordingStatus("🔴 Recording in progress...");
    voiceRecognition.start();
    isVoiceCaptureRunning = true;
}

function stopVoiceCapture() {
    if (voiceRecognition && isVoiceCaptureRunning) {
        voiceRecognition.stop();
        updateRecordingStatus("⚪ Recording stopped");
        isVoiceCaptureRunning = false;
        saveDraft();
    }
}

function saveLatestEntry(entry) {
    localStorage.setItem(LATEST_CAPTAINS_LOG_KEY, JSON.stringify(entry));
}

function getLogHistory() {
    const savedHistory = localStorage.getItem(CAPTAINS_LOG_HISTORY_KEY);

    if (!savedHistory) {
        return [];
    }

    try {
        const history = JSON.parse(savedHistory);
        return Array.isArray(history) ? history : [];
    } catch (error) {
        console.error("Unable to read Captain's Log history:", error);
        localStorage.removeItem(CAPTAINS_LOG_HISTORY_KEY);
        return [];
    }
}

function saveLogHistory(history) {
    localStorage.setItem(CAPTAINS_LOG_HISTORY_KEY, JSON.stringify(history));
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

function getLatestEntry() {
    const savedEntry = localStorage.getItem(LATEST_CAPTAINS_LOG_KEY);

    if (!savedEntry) {
        return null;
    }

    try {
        return JSON.parse(savedEntry);
    } catch (error) {
        console.error("Unable to read latest Captain's Log entry:", error);
        localStorage.removeItem(LATEST_CAPTAINS_LOG_KEY);
        return null;
    }
}

function advanceStardateCounter(stardate) {
    const dateKey = stardate.split(".")[0];

    if (!dateKey) {
        return;
    }

    const counterKey = `usstjr-stardate-${dateKey}`;
    const currentCounter = parseInt(localStorage.getItem(counterKey) || "1", 10);

    localStorage.setItem(counterKey, String(currentCounter + 1));
}

function loadLatestEntryToCommandDeck() {
    const entry = getLatestEntry();

    if (!entry) {
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

function renderRecentLogsToCommandDeck() {
    const recentLogsList = document.getElementById("recentLogsList");

    if (!recentLogsList) {
        return;
    }

    const history = getLogHistory();
    recentLogsList.textContent = "";

    if (history.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No saved logs yet.";
        recentLogsList.appendChild(emptyMessage);
        return;
    }

    history.slice(0, 5).forEach(function (entry) {
        const item = document.createElement("article");
        const title = document.createElement("h3");
        const meta = document.createElement("p");
        const metrics = document.createElement("p");
        const restoreLink = document.createElement("a");

        item.className = "history-entry";
        title.textContent = `Stardate ${entry.stardate || "--"}`;
        meta.textContent = entry.date || "No date recorded";
        metrics.textContent = `Mood ${entry.mood || "--"} · Energy ${entry.energy || "--"} · Pain ${entry.pain || "--"} · Stress ${entry.stress || "--"}`;
        restoreLink.className = "button secondary-button compact-button";
        restoreLink.href = `captains-log.html?log=${encodeURIComponent(entry.id)}`;
        restoreLink.textContent = "Open Log";

        item.appendChild(title);
        item.appendChild(meta);
        item.appendChild(metrics);
        item.appendChild(restoreLink);
        recentLogsList.appendChild(item);
    });
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
        alert("Unable to load that Captain's Log entry.");
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
