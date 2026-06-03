const CAPTAINS_LOG_DRAFT_KEY = "usstjr-captains-log-draft";
const LATEST_CAPTAINS_LOG_KEY = "usstjr-latest-captains-log";

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

function setTodayDefaults() {
    const today = new Date();

    const dateInput = document.getElementById("dateInput");
    const stardateInput = document.getElementById("stardateInput");

    if (dateInput && !dateInput.value) {
        dateInput.value = today.toISOString().split("T")[0];
    }

    if (stardateInput && !stardateInput.value) {
        stardateInput.value = generateStardate();
    }
}

window.addEventListener("DOMContentLoaded", initialiseCaptainsLogPage);

function initialiseCaptainsLogPage() {
    setTodayDefaults();
    loadDraft();
    setupDraftAutosave();
    loadLatestEntryToCommandDeck();
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
    const stardate = getFieldValue("stardateInput");
    const date = getFieldValue("dateInput");

    const mood = getFieldValue("mood");
    const energy = getFieldValue("energy");
    const pain = getFieldValue("pain");
    const stress = getFieldValue("stress");

    const wins = getFieldValue("wins");
    const challenges = getFieldValue("challenges");
    const lessons = getFieldValue("lessons");
    const gratitude = getFieldValue("gratitude");

    const health = getFieldValue("health");
    const career = getFieldValue("career");
    const mindbody = getFieldValue("mindbody");
    const voiceCapture = getFieldValue("voiceCapture");

    const priority1 = getFieldValue("priority1");
    const priority2 = getFieldValue("priority2");
    const priority3 = getFieldValue("priority3");

    const markdown = `# Stardate ${stardate}

Date: ${date}

## Status

Mood: ${mood}
Energy: ${energy}
Pain: ${pain}
Stress: ${stress}

## Today's Wins

${wins}

## Challenges

${challenges}

## Lessons Learned

${lessons}

## Gratitude

${gratitude}

## Mission Progress

### Health

${health}

### Career

${career}

### TJR Mind Body

${mindbody}

## Raw Voice Reflection

${voiceCapture}

## Tomorrow's Priorities

1. ${priority1}
2. ${priority2}
3. ${priority3}
`;

    const markdownOutput = document.getElementById("markdownOutput");

    if (markdownOutput) {
        markdownOutput.value = markdown;
    }

    saveDraft();
    saveLatestEntry({
        stardate: stardate,
        date: date,
        mood: mood,
        energy: energy,
        pain: pain,
        stress: stress
    });
}

function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value : "";
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

    const stardate = getFieldValue("stardateInput");
    const date = getFieldValue("dateInput");

    const filename = `${date}-Stardate-${stardate}.md`;

    const dateKey = stardate.split(".")[0];
    const counterKey = `usstjr-stardate-${dateKey}`;

    const currentCounter = parseInt(localStorage.getItem(counterKey) || "1", 10);
    localStorage.setItem(counterKey, String(currentCounter + 1));
    clearDraft();

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

    resetFormFields();
    setTodayDefaults();
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

function loadLatestEntryToCommandDeck() {
    const savedEntry = localStorage.getItem(LATEST_CAPTAINS_LOG_KEY);

    if (!savedEntry) {
        return;
    }

    try {
        const entry = JSON.parse(savedEntry);

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
    } catch (error) {
        console.error("Unable to load latest Captain's Log entry:", error);
        localStorage.removeItem(LATEST_CAPTAINS_LOG_KEY);
    }
}

function setTextContent(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}