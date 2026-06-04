import {
    CAPTAINS_LOG_HISTORY_KEY,
    LATEST_CAPTAINS_LOG_KEY,
    MEDICAL_BAY_HISTORY_KEY
} from "../core/constants.js";
import { storageGetJson } from "../core/storage.js";

const EMPTY_MESSAGE = "No local records found yet.\n\nStart by saving a Captain's Log or Medical Bay entry.";
const FUTURE_STORAGE_KEYS = [
    "usstjr-cpap-history",
    "usstjr-weight-history",
    "usstjr-medication-history"
];

export function answerLocalQuery(question) {
    const queryType = classifyLocalQuery(question);

    if (queryType === "sleep") {
        return getSleepTrend();
    }

    if (queryType === "pain") {
        return getPainTrend();
    }

    if (queryType === "medical") {
        return getLatestMedicalBayEntry();
    }

    if (queryType === "summary") {
        return getSevenDaySummary();
    }

    return getLatestCaptainLog();
}

export function classifyLocalQuery(question) {
    const query = String(question || "").toLowerCase();

    if (/\b(sleep|sleeping|rest)\b/.test(query)) {
        return "sleep";
    }

    if (/\b(pain|pain trend)\b/.test(query)) {
        return "pain";
    }

    if (/\b(medical|medical bay|health log|health)\b/.test(query)) {
        return "medical";
    }

    if (/\b(7 days|seven days|summary|summarise|summarize)\b/.test(query)) {
        return "summary";
    }

    if (/\b(latest log|captain log|captain's log|log)\b/.test(query)) {
        return "captain";
    }

    return "captain";
}

export function getLatestCaptainLog() {
    const history = getCaptainLogHistory();
    const latest = history[0] || storageGetJson(LATEST_CAPTAINS_LOG_KEY, null);

    if (!latest) {
        return emptyResponse("Latest Captain's Log");
    }

    const fields = latest.fields || latest;

    return {
        title: "Latest Captain's Log",
        sections: [{
            heading: "Status",
            items: [
                `Stardate: ${latest.stardate || fields.stardateInput || "--"}`,
                `Date: ${latest.date || fields.dateInput || "--"}`,
                `Mood: ${displayValue(latest.mood !== undefined ? latest.mood : fields.mood)}`,
                `Energy: ${displayValue(latest.energy !== undefined ? latest.energy : fields.energy)}`,
                `Pain: ${displayValue(latest.pain !== undefined ? latest.pain : fields.pain)}`,
                `Stress: ${displayValue(latest.stress !== undefined ? latest.stress : fields.stress)}`
            ]
        }],
        observation: fields.wins ? `Latest win recorded: ${fields.wins}` : "Latest Captain's Log metrics are available."
    };
}

export function getLatestMedicalBayEntry() {
    const history = getMedicalBayHistory();
    const latest = history[0];

    if (!latest) {
        return emptyResponse("Latest Medical Bay Entry");
    }

    return {
        title: "Latest Medical Bay Entry",
        sections: [{
            heading: "Health Metrics",
            items: [
                `Date: ${displayValue(latest.date)}`,
                `Pain: ${displayValue(latest.overallPain)}`,
                `Sleep: ${displayValue(latest.sleepHours)} hours`,
                `Sleep quality: ${displayValue(latest.sleepQuality)}`,
                `Wakeups: ${displayValue(latest.wakeups)}`,
                `Energy: ${displayValue(latest.energy)}`,
                `Stress: ${displayValue(latest.stress)}`
            ]
        }],
        observation: latest.triggers ? `Trigger noted: ${latest.triggers}` : "Latest Medical Bay record is available."
    };
}

export function getPainTrend() {
    const entries = getMedicalBayHistory().filter(function (entry) {
        return isFiniteNumber(entry.overallPain);
    }).slice(0, 7);

    if (entries.length === 0) {
        return emptyResponse("Pain Trend");
    }

    const latest = Number(entries[0].overallPain);
    const averagePain = average(entries.map(function (entry) {
        return entry.overallPain;
    }));
    const oldest = Number(entries[entries.length - 1].overallPain);
    const direction = getDirection(latest - oldest);

    return {
        title: "Pain Trend",
        sections: [{
            heading: "Pain Metrics",
            items: [
                `Latest pain: ${latest}`,
                `Average across last ${entries.length} logs: ${averagePain}`,
                `Direction: ${direction}`
            ]
        }],
        observation: direction === "Stable" ? "Pain appears close to your recent baseline." : `Pain is ${direction.toLowerCase()} compared with the oldest recent log.`
    };
}

export function getSleepTrend() {
    const entries = getMedicalBayHistory().filter(function (entry) {
        return isFiniteNumber(entry.sleepHours);
    }).slice(0, 7);

    if (entries.length === 0) {
        return emptyResponse("Sleep Trend");
    }

    const latest = Number(entries[0].sleepHours);
    const averageSleep = average(entries.map(function (entry) {
        return entry.sleepHours;
    }));
    const oldest = Number(entries[entries.length - 1].sleepHours);
    const direction = getDirection(latest - oldest);

    return {
        title: "Sleep Trend",
        sections: [{
            heading: "Sleep Metrics",
            items: [
                `Latest sleep: ${latest} hours`,
                `Average across last ${entries.length} logs: ${averageSleep} hours`,
                `Direction: ${direction}`
            ]
        }],
        observation: direction === "Stable" ? "Sleep appears close to your recent baseline." : `Sleep is ${direction.toLowerCase()} compared with the oldest recent log.`
    };
}

export function getSevenDaySummary() {
    const captainLogs = getCaptainLogHistory().slice(0, 7);
    const medicalLogs = getMedicalBayHistory().slice(0, 7);

    if (captainLogs.length === 0 && medicalLogs.length === 0) {
        return emptyResponse("Summarise Last 7 Days");
    }

    return {
        title: "Summarise Last 7 Days",
        sections: [{
            heading: "Records",
            items: [
                `Captain's Logs: ${captainLogs.length}`,
                `Medical Bay Logs: ${medicalLogs.length}`,
                `Average pain: ${averageOrDash(medicalLogs.map(function (entry) { return entry.overallPain; }))}`,
                `Average sleep: ${averageOrDash(medicalLogs.map(function (entry) { return entry.sleepHours; }))}`,
                `Average energy: ${averageOrDash(medicalLogs.map(function (entry) { return entry.energy; }))}`
            ]
        }],
        observation: "Local records are ready for trend review."
    };
}

export function getCaptainLogHistory() {
    return sortByDate(storageGetJson(CAPTAINS_LOG_HISTORY_KEY, []), getCaptainLogDate);
}

export function getMedicalBayHistory() {
    return sortByDate(storageGetJson(MEDICAL_BAY_HISTORY_KEY, []), function (entry) {
        return entry.date;
    });
}

export function getFutureStorageKeys() {
    return FUTURE_STORAGE_KEYS.slice();
}

export function formatComputerResponse(response) {
    if (response.empty) {
        return `${response.title}\n\n${response.observation}`;
    }

    const lines = [response.title, ""];

    response.sections.forEach(function (section) {
        lines.push(section.heading);
        section.items.forEach(function (item) {
            lines.push(`- ${item}`);
        });
        lines.push("");
    });

    lines.push("Observation");
    lines.push(response.observation);

    return lines.join("\n").trim();
}

function emptyResponse(title) {
    return {
        title: title,
        sections: [],
        observation: EMPTY_MESSAGE,
        empty: true
    };
}

function getCaptainLogDate(entry) {
    if (entry.date) {
        return entry.date;
    }

    return entry.fields ? entry.fields.dateInput : "";
}

function sortByDate(entries, getDate) {
    return (Array.isArray(entries) ? entries : []).slice().sort(function (a, b) {
        return String(getDate(b) || "").localeCompare(String(getDate(a) || "")) || String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    });
}

function average(values) {
    const numericValues = values.map(Number).filter(Number.isFinite);
    const total = numericValues.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    return (total / numericValues.length).toFixed(1);
}

function averageOrDash(values) {
    return values.some(isFiniteNumber) ? average(values) : "--";
}

function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
}

function displayValue(value, fallback) {
    const placeholder = fallback === undefined ? "--" : fallback;

    return value !== undefined && value !== null && value !== "" ? String(value) : placeholder;
}

function getDirection(change) {
    if (change >= 0.3) {
        return "Slightly up";
    }

    if (change <= -0.3) {
        return "Slightly down";
    }

    return "Stable";
}
