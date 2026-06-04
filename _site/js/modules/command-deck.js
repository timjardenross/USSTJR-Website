import {
    CAPTAINS_LOG_HISTORY_KEY,
    CAPTAINS_LOG_HISTORY_LIMIT,
    LATEST_CAPTAINS_LOG_KEY
} from "../core/constants.js";
import { setTextContent, downloadTextFile } from "../core/dom.js";
import { showStatus } from "../core/status.js";
import { storageGetJson, storageRemoveItem, storageSetJson } from "../core/storage.js";
import { confirmAction } from "./confirm-modal.js";

export function saveLatestEntry(entry) {
    storageSetJson(LATEST_CAPTAINS_LOG_KEY, entry);
}

export function getLatestEntry() {
    return storageGetJson(LATEST_CAPTAINS_LOG_KEY, null);
}

export function getLogHistory() {
    const history = storageGetJson(CAPTAINS_LOG_HISTORY_KEY, []);
    return Array.isArray(history) ? history : [];
}

export function saveLogHistory(history) {
    storageSetJson(CAPTAINS_LOG_HISTORY_KEY, history);
}

export function saveLogHistoryEntry(logData, markdown) {
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

export function createLogHistoryEntryId(stardate, date) {
    return `${date || "undated"}-${stardate || "unstardated"}`
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-");
}

export function loadLatestEntryToCommandDeck() {
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

export function renderRecentLogsToCommandDeck() {
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

export function getHistoryEntrySearchText(entry) {
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

export function downloadHistoryEntry(entryId) {
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

export async function deleteHistoryEntry(entryId) {
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

export async function clearLogHistory() {
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
