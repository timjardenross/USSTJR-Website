import {
    CAPTAINS_LOG_DRAFT_KEY,
    CAPTAINS_LOG_FIELD_IDS,
    CAPTAINS_LOG_METRIC_FIELDS
} from "../core/constants.js";
import { advanceStardateCounter, setTodayDefaults } from "../core/dates.js";
import { downloadTextFile, getFieldValue, setFieldValue } from "../core/dom.js";
import { showStatus } from "../core/status.js";
import { storageGetJson, storageRemoveItem, storageSetJson } from "../core/storage.js";
import {
    createLogHistoryEntryId,
    getLatestEntry,
    getLogHistory,
    loadLatestEntryToCommandDeck,
    renderRecentLogsToCommandDeck,
    saveLatestEntry,
    saveLogHistoryEntry
} from "./command-deck.js";
import { confirmAction } from "./confirm-modal.js";

export function getDraftData() {
    const draft = {};

    CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            draft[fieldId] = field.value;
        }
    });

    return draft;
}

export function saveDraft() {
    const draft = getDraftData();
    storageSetJson(CAPTAINS_LOG_DRAFT_KEY, draft);
}

export function loadDraft() {
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

export function setupDraftAutosave() {
    CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            field.addEventListener("input", saveDraft);
            field.addEventListener("change", saveDraft);
        }
    });
}

export function clearDraft() {
    storageRemoveItem(CAPTAINS_LOG_DRAFT_KEY);
}

export async function clearDraftAndResetForm() {
    const confirmClear = await confirmAction("Clear this Captain's Log draft?");

    if (!confirmClear) {
        return;
    }

    clearDraft();
    resetFormFields();
    setTodayDefaults();
    showStatus("Captain's Log draft reset.", "success");
}

export function resetFormFields() {
    CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field) {
            field.value = "";
        }
    });
}

export function generateLog() {
    if (!validateMetricInputs()) {
        return;
    }

    setMarkdownOutput(buildCaptainLogMarkdown(getCaptainLogData()));
    saveDraft();
}

export function getCaptainLogData() {
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

export function buildCaptainLogMarkdown(data) {
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

export function setMarkdownOutput(markdown) {
    const markdownOutput = document.getElementById("markdownOutput");

    if (markdownOutput) {
        markdownOutput.value = markdown;
    }
}

export function validateMetricInputs() {
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

export function saveCommandDeckStatus() {
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

export function copyLog() {
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

export function downloadLog() {
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

export function getSavedDraft() {
    return storageGetJson(CAPTAINS_LOG_DRAFT_KEY, null);
}

export function restoreDraft(draft) {
    if (draft) {
        storageSetJson(CAPTAINS_LOG_DRAFT_KEY, draft);
    } else {
        storageRemoveItem(CAPTAINS_LOG_DRAFT_KEY);
    }
}

export function loadHistoryEntryFromUrl() {
    const stardateInput = document.getElementById("stardateInput");

    if (!stardateInput) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const entryId = params.get("log");

    if (!entryId) {
        return;
    }

    const entry = getLogHistory().find(function (historyEntry) {
        return historyEntry.id === entryId;
    });

    if (!entry || !entry.fields) {
        showStatus("Unable to load that saved Captain's Log entry.", "error");
        return;
    }

    CAPTAINS_LOG_FIELD_IDS.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        if (field && entry.fields[fieldId] !== undefined) {
            field.value = entry.fields[fieldId];
        }
    });

    setMarkdownOutput(entry.markdown || "");
    showStatus("Saved Captain's Log loaded.", "success");
}
