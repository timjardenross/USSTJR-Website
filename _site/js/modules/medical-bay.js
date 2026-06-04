import {
    MEDICAL_BAY_DRAFT_KEY,
    MEDICAL_BAY_FIELD_IDS,
    MEDICAL_BAY_HISTORY_KEY,
    MEDICAL_BAY_HISTORY_LIMIT,
    MEDICAL_BAY_METRIC_FIELDS,
    MEDICAL_BAY_PAIN_TYPE_IDS
} from "../core/constants.js";
import { setMedicalBayDefaults } from "../core/dates.js";
import { downloadTextFile, getFieldValue, setFieldValue, setTextContent } from "../core/dom.js";
import { showStatus } from "../core/status.js";
import { storageGetJson, storageRemoveItem, storageSetJson } from "../core/storage.js";
import { confirmAction } from "./confirm-modal.js";

export function getMedicalBayDraftData() {
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

export function saveMedicalBayDraft() {
    const draft = getMedicalBayDraftData();
    storageSetJson(MEDICAL_BAY_DRAFT_KEY, draft);
}

export function loadMedicalBayDraft() {
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

export function setupMedicalBayAutosave() {
    MEDICAL_BAY_FIELD_IDS.concat(MEDICAL_BAY_PAIN_TYPE_IDS).forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            field.addEventListener("input", saveMedicalBayDraft);
            field.addEventListener("change", saveMedicalBayDraft);
        }
    });
}

export async function resetMedicalBayForm() {
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

export function getMedicalBayData() {
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

export function getSelectedMedicalPainTypes() {
    return MEDICAL_BAY_PAIN_TYPE_IDS.map(function (fieldId) {
        const field = document.getElementById(fieldId);
        return field && field.checked ? field.value : "";
    }).filter(Boolean);
}

export function setSelectedMedicalPainTypes(painTypes) {
    MEDICAL_BAY_PAIN_TYPE_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            field.checked = painTypes.indexOf(field.value) !== -1;
        }
    });
}

export function buildMedicalBayMarkdown(data, trendSummary) {
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

export function buildMedicalTrendSummary(data) {
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

export function averageNumericValues(values) {
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

export function validateMedicalBayInputs() {
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

export function saveMedicalBayLog() {
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

export function downloadMedicalBayLog() {
    const markdown = getFieldValue("medicalSummaryOutput");

    if (!markdown) {
        showStatus("Save a Medical Bay health log first.", "error");
        return;
    }

    const date = getFieldValue("healthDateInput") || "undated";
    downloadTextFile(`${date}-Medical-Bay.md`, markdown, "text/markdown");
}

export function getMedicalBayHistory() {
    const history = storageGetJson(MEDICAL_BAY_HISTORY_KEY, []);
    return Array.isArray(history) ? history : [];
}

export function saveMedicalBayHistory(history) {
    storageSetJson(MEDICAL_BAY_HISTORY_KEY, history);
}

export function saveMedicalBayHistoryEntry(data) {
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

export function createMedicalBayEntryId(date) {
    return `medical-${date || "undated"}`
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-");
}

export function loadLatestMedicalEntry() {
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

export function renderMedicalHistory() {
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

export function getSavedMedicalBayDraft() {
    return storageGetJson(MEDICAL_BAY_DRAFT_KEY, null);
}

export function restoreMedicalBayData(medicalBay) {
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
