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
    const cpap = getCpapDataFromFields();
    const weight = getWeightDataFromFields();

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
        cpap: cpap,
        weight: weight,
        summaryOutput: getFieldValue("medicalSummaryOutput")
    };
}

export function getCpapDataFromFields() {
    const usageMinutes = parseCpapUsageTime(getFieldValue("cpapUsageTime"));

    if (!hasCpapMetricInput()) {
        return null;
    }

    return {
        date: getFieldValue("cpapDateInput"),
        score: Number(getFieldValue("cpapScore")),
        usageMinutes: usageMinutes,
        maskSeal: Number(getFieldValue("cpapMaskSeal")),
        eventsPerHour: Number(getFieldValue("cpapEventsPerHour")),
        maskOffCount: Number(getFieldValue("cpapMaskOffCount")),
        notes: getFieldValue("cpapNotes")
    };
}

export function hasCpapMetricInput() {
    return [
        "cpapScore",
        "cpapUsageTime",
        "cpapMaskSeal",
        "cpapEventsPerHour",
        "cpapMaskOffCount"
    ].some(function (fieldId) {
        return getFieldValue(fieldId).trim() !== "";
    });
}

export function parseCpapUsageTime(value) {
    const usage = String(value || "").trim();
    const match = usage.match(/^(\d{1,2}):([0-5]\d)$/);

    if (!match) {
        return null;
    }

    return (Number(match[1]) * 60) + Number(match[2]);
}

export function formatCpapUsage(minutes) {
    if (minutes === null || minutes === undefined || minutes === "") {
        return "--";
    }

    const numericMinutes = Number(minutes);

    if (!Number.isFinite(numericMinutes)) {
        return "--";
    }

    const roundedMinutes = Math.round(numericMinutes);
    const hours = Math.floor(roundedMinutes / 60);
    const remainder = roundedMinutes % 60;

    return `${hours}h ${String(remainder).padStart(2, "0")}m`;
}

export function getCpapStatus(score) {
    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
        return "--";
    }

    if (numericScore >= 90) {
        return "🟢 Excellent";
    }

    if (numericScore >= 80) {
        return "🟡 Good";
    }

    if (numericScore >= 70) {
        return "🟠 Fair";
    }

    return "🔴 Poor";
}

export function getWeightDataFromFields() {
    if (!hasWeightMetricInput()) {
        return null;
    }

    return {
        date: getFieldValue("weightDateInput"),
        weight: Number(getFieldValue("weightKg")),
        waist: getFieldValue("weightWaistCm").trim() === "" ? null : Number(getFieldValue("weightWaistCm")),
        notes: getFieldValue("weightNotes")
    };
}

export function hasWeightMetricInput() {
    return [
        "weightKg",
        "weightWaistCm",
        "weightNotes"
    ].some(function (fieldId) {
        return getFieldValue(fieldId).trim() !== "";
    });
}

export function formatWeight(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "--";
    }

    return `${numericValue.toFixed(1)} kg`;
}

export function formatWeightChange(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "--";
    }

    const sign = numericValue > 0 ? "+" : "";
    return `${sign}${numericValue.toFixed(1)} kg`;
}

export function getWeightTrendDirection(change) {
    const numericChange = Number(change);

    if (!Number.isFinite(numericChange)) {
        return "--";
    }

    if (numericChange >= 0.2) {
        return "Increasing";
    }

    if (numericChange <= -0.2) {
        return "Decreasing";
    }

    return "Stable";
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
    const cpapEntries = getCpapEntriesForCurrentData(data);
    const cpapCompliance = getCpapComplianceSummary(cpapEntries);
    const weightSummary = buildWeightTrendSummary(getWeightEntriesForCurrentData(data));

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

## CPAP Summary

Latest Score: ${data.cpap ? data.cpap.score : "--"}
Latest Usage: ${data.cpap ? formatCpapUsage(data.cpap.usageMinutes) : "--"}
Latest AHI: ${data.cpap ? data.cpap.eventsPerHour : "--"}
Mask Seal: ${data.cpap ? data.cpap.maskSeal : "--"}/20
Mask Off Count: ${data.cpap ? data.cpap.maskOffCount : "--"}
Compliance: ${cpapCompliance.percent}
Status: ${data.cpap ? getCpapStatus(data.cpap.score) : "--"}
Notes: ${data.cpap && data.cpap.notes ? data.cpap.notes : "Not recorded"}

## Weight Summary

Current Weight: ${data.weight ? formatWeight(data.weight.weight) : "--"}
Weekly Change: ${weightSummary.weeklyChange}
Trend Direction: ${weightSummary.trendDirection}
Highest Recorded Weight: ${weightSummary.highest}
Lowest Recorded Weight: ${weightSummary.lowest}
4 Week Trend: ${weightSummary.fourWeekTrend}
12 Week Trend: ${weightSummary.twelveWeekTrend}
Overall Trend: ${weightSummary.overallTrend}
Waist Measurement: ${data.weight && data.weight.waist !== null ? `${data.weight.waist.toFixed(1)} cm` : "--"}
Notes: ${data.weight && data.weight.notes ? data.weight.notes : "Not recorded"}

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
    const cpapSummary = buildCpapTrendSummary(getCpapEntriesForCurrentData(data));
    const weightSummary = buildWeightTrendSummary(getWeightEntriesForCurrentData(data));
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

    if (data.cpap) {
        lines.push(`CPAP latest status is ${getCpapStatus(data.cpap.score)} with ${formatCpapUsage(data.cpap.usageMinutes)} usage and ${data.cpap.eventsPerHour} events/hr.`);
    }

    if (cpapSummary.totalNights > 0) {
        lines.push(`CPAP 7-log averages: score ${cpapSummary.averageScore}, usage ${cpapSummary.averageUsage}, events/hr ${cpapSummary.averageEventsPerHour}.`);
        lines.push(`CPAP 30-day compliance is ${cpapSummary.compliance.percent} (${cpapSummary.compliance.compliantNights} compliant nights from ${cpapSummary.compliance.totalNights}).`);
    }

    if (data.weight) {
        lines.push(`Weight is ${formatWeight(data.weight.weight)} with weekly change ${weightSummary.weeklyChange} and ${weightSummary.trendDirection.toLowerCase()} direction.`);
    }

    return lines.join("\n");
}

export function getCpapEntriesForCurrentData(data) {
    const historyEntries = getCpapEntries(getMedicalBayHistory());

    if (!data.cpap) {
        return historyEntries;
    }

    return [data.cpap].concat(historyEntries.filter(function (entry) {
        return entry.date !== data.cpap.date;
    }));
}

export function getWeightEntriesForCurrentData(data) {
    const historyEntries = getWeightEntries(getMedicalBayHistory());

    if (!data.weight) {
        return historyEntries;
    }

    return [data.weight].concat(historyEntries.filter(function (entry) {
        return entry.date !== data.weight.date;
    }));
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

export function getCpapEntries(history) {
    return (history || []).map(function (entry) {
        return entry.cpap || null;
    }).filter(function (entry) {
        return entry && entry.date && Number.isFinite(Number(entry.score));
    }).sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
    });
}

export function buildCpapTrendSummary(cpapEntries) {
    const entries = cpapEntries || getCpapEntries(getMedicalBayHistory());
    const recentSeven = entries.slice(0, 7);
    const compliance = getCpapComplianceSummary(entries);

    return {
        latest: entries[0] || null,
        averageScore: averageNumericValues(recentSeven.map(function (entry) {
            return entry.score;
        })) || "--",
        averageUsageMinutes: averageNumericValues(recentSeven.map(function (entry) {
            return entry.usageMinutes;
        })),
        averageUsage: formatCpapUsage(averageNumericValues(recentSeven.map(function (entry) {
            return entry.usageMinutes;
        }))),
        averageEventsPerHour: averageNumericValues(recentSeven.map(function (entry) {
            return entry.eventsPerHour;
        })) || "--",
        compliance: compliance,
        totalNights: entries.length
    };
}

export function getCpapComplianceSummary(cpapEntries) {
    const entries = (cpapEntries || getCpapEntries(getMedicalBayHistory())).slice(0, 30);
    const totalNights = entries.length;
    const compliantNights = entries.filter(function (entry) {
        return Number(entry.usageMinutes) >= 240;
    }).length;
    const percent = totalNights === 0 ? "--" : `${Math.round((compliantNights / totalNights) * 100)}%`;

    return {
        compliantNights: compliantNights,
        totalNights: totalNights,
        percent: percent
    };
}

export function getWeightEntries(history) {
    return (history || []).map(function (entry) {
        return entry.weight || null;
    }).filter(function (entry) {
        return entry && entry.date && Number.isFinite(Number(entry.weight));
    }).sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
    });
}

export function buildWeightTrendSummary(weightEntries) {
    const entries = weightEntries || getWeightEntries(getMedicalBayHistory());
    const latest = entries[0] || null;
    const previous = entries[1] || null;
    const weeklyChangeValue = latest && previous ? latest.weight - previous.weight : null;
    const weights = entries.map(function (entry) {
        return Number(entry.weight);
    });
    const highest = weights.length ? Math.max.apply(null, weights) : null;
    const lowest = weights.length ? Math.min.apply(null, weights) : null;

    return {
        latest: latest,
        weeklyChangeValue: weeklyChangeValue,
        weeklyChange: weeklyChangeValue === null ? "--" : formatWeightChange(weeklyChangeValue),
        trendDirection: weeklyChangeValue === null ? "--" : getWeightTrendDirection(weeklyChangeValue),
        highest: highest === null ? "--" : formatWeight(highest),
        lowest: lowest === null ? "--" : formatWeight(lowest),
        fourWeekTrend: getRollingWeightTrend(entries, 4),
        twelveWeekTrend: getRollingWeightTrend(entries, 12),
        overallTrend: getRollingWeightTrend(entries, entries.length),
        totalEntries: entries.length
    };
}

export function getRollingWeightTrend(entries, limit) {
    const scopedEntries = (entries || []).slice(0, limit);

    if (scopedEntries.length < 2) {
        return "--";
    }

    const latest = scopedEntries[0];
    const oldest = scopedEntries[scopedEntries.length - 1];
    const change = latest.weight - oldest.weight;

    return `${getWeightTrendDirection(change)} (${formatWeightChange(change)})`;
}

export function renderCpapDashboard() {
    const summary = buildCpapTrendSummary();
    const latest = summary.latest;

    if (!document.getElementById("cpapLatestScore")) {
        return;
    }

    if (!latest) {
        setTextContent("cpapLatestScore", "--");
        setTextContent("cpapLatestUsage", "--");
        setTextContent("cpapLatestAhi", "--");
        setTextContent("cpapLatestStatus", "--");
        setTextContent("cpapAverageScore", "--");
        setTextContent("cpapAverageUsage", "--");
        setTextContent("cpapAverageAhi", "--");
        setTextContent("cpapCompliance", "--");
        return;
    }

    setTextContent("cpapLatestScore", String(latest.score));
    setTextContent("cpapLatestUsage", formatCpapUsage(latest.usageMinutes));
    setTextContent("cpapLatestAhi", String(latest.eventsPerHour));
    setTextContent("cpapLatestStatus", getCpapStatus(latest.score));
    setTextContent("cpapAverageScore", summary.averageScore);
    setTextContent("cpapAverageUsage", summary.averageUsage);
    setTextContent("cpapAverageAhi", summary.averageEventsPerHour);
    setTextContent("cpapCompliance", `${summary.compliance.percent} (${summary.compliance.compliantNights}/${summary.compliance.totalNights})`);
}

export function renderWeightDashboard() {
    const summary = buildWeightTrendSummary();
    const latest = summary.latest;

    if (!document.getElementById("weightCurrent")) {
        return;
    }

    if (!latest) {
        setTextContent("weightCurrent", "--");
        setTextContent("weightWeeklyChange", "--");
        setTextContent("weightTrendDirection", "--");
        setTextContent("weightHighest", "--");
        setTextContent("weightLowest", "--");
        setTextContent("weightFourWeekTrend", "--");
        setTextContent("weightTwelveWeekTrend", "--");
        setTextContent("weightOverallTrend", "--");
        return;
    }

    setTextContent("weightCurrent", formatWeight(latest.weight));
    setTextContent("weightWeeklyChange", summary.weeklyChange);
    setTextContent("weightTrendDirection", summary.trendDirection);
    setTextContent("weightHighest", summary.highest);
    setTextContent("weightLowest", summary.lowest);
    setTextContent("weightFourWeekTrend", summary.fourWeekTrend);
    setTextContent("weightTwelveWeekTrend", summary.twelveWeekTrend);
    setTextContent("weightOverallTrend", summary.overallTrend);
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

    if (!validateCpapInputs()) {
        return false;
    }

    if (!validateWeightInputs()) {
        return false;
    }

    return true;
}

export function validateCpapInputs() {
    if (!hasCpapMetricInput()) {
        return true;
    }

    const date = document.getElementById("cpapDateInput");
    const score = document.getElementById("cpapScore");
    const usage = document.getElementById("cpapUsageTime");
    const maskSeal = document.getElementById("cpapMaskSeal");
    const eventsPerHour = document.getElementById("cpapEventsPerHour");
    const maskOffCount = document.getElementById("cpapMaskOffCount");

    if (!date || date.value.trim() === "") {
        showStatus("CPAP date is required.", "error");
        if (date) {
            date.focus();
        }
        return false;
    }

    if (!validateNumberField(score, "myAir Score", 0, 100)) {
        return false;
    }

    if (!usage || parseCpapUsageTime(usage.value) === null) {
        showStatus("CPAP usage time must use HH:MM format.", "error");
        if (usage) {
            usage.focus();
        }
        return false;
    }

    if (!validateNumberField(maskSeal, "Mask seal rating", 0, 20)) {
        return false;
    }

    if (!validateNumberField(eventsPerHour, "Events per hour", 0, null)) {
        return false;
    }

    if (!validateNumberField(maskOffCount, "Mask off count", 0, null)) {
        return false;
    }

    return true;
}

export function validateNumberField(field, label, min, max) {
    if (!field || field.value.trim() === "") {
        showStatus(`${label} is required.`, "error");
        if (field) {
            field.focus();
        }
        return false;
    }

    const value = Number(field.value);

    if (!Number.isFinite(value) || value < min || (max !== null && value > max)) {
        showStatus(max === null ? `${label} must be ${min} or higher.` : `${label} must be between ${min} and ${max}.`, "error");
        field.focus();
        return false;
    }

    return true;
}

export function validateWeightInputs() {
    if (!hasWeightMetricInput()) {
        return true;
    }

    const date = document.getElementById("weightDateInput");
    const weight = document.getElementById("weightKg");
    const waist = document.getElementById("weightWaistCm");

    if (!date || date.value.trim() === "") {
        showStatus("Weight entry date is required.", "error");
        if (date) {
            date.focus();
        }
        return false;
    }

    if (!validateNumberField(weight, "Weight", 0, null)) {
        return false;
    }

    if (waist && waist.value.trim() !== "" && !validateNumberField(waist, "Waist measurement", 0, null)) {
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
        renderCpapDashboard();
        renderWeightDashboard();
        return;
    }

    setTextContent("medicalLatestDate", latestEntry.date || "No health log recorded yet");
    setTextContent("medicalLatestPain", latestEntry.overallPain || "--");
    setTextContent("medicalLatestSleep", latestEntry.sleepHours || "--");
    setTextContent("medicalLatestEnergy", latestEntry.energy || "--");
    setTextContent("medicalLatestStress", latestEntry.stress || "--");
    renderCpapDashboard();
    renderWeightDashboard();
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
        metrics.textContent = `Pain ${entry.overallPain || "--"} · Sleep ${entry.sleepHours || "--"}h · Energy ${entry.energy || "--"} · Stress ${entry.stress || "--"} · CPAP ${entry.cpap ? `${entry.cpap.score} ${formatCpapUsage(entry.cpap.usageMinutes)}` : "--"} · Weight ${entry.weight ? formatWeight(entry.weight.weight) : "--"}`;
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
