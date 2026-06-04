export const CAPTAINS_LOG_DRAFT_KEY = "usstjr-captains-log-draft";
export const LATEST_CAPTAINS_LOG_KEY = "usstjr-latest-captains-log";
export const CAPTAINS_LOG_HISTORY_KEY = "usstjr-captains-log-history";
export const CAPTAINS_LOG_HISTORY_LIMIT = 20;
export const MEDICAL_BAY_DRAFT_KEY = "usstjr-medical-bay-draft";
export const MEDICAL_BAY_HISTORY_KEY = "usstjr-medical-bay-history";
export const MEDICAL_BAY_HISTORY_LIMIT = 30;
export const BACKUP_VERSION = 1;
export const VOICE_ENABLED_KEY = "usstjr-voice-enabled";

export const CAPTAINS_LOG_FIELD_IDS = [
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

export const CAPTAINS_LOG_METRIC_FIELDS = [
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

export const MEDICAL_BAY_FIELD_IDS = [
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
    "cpapDateInput",
    "cpapScore",
    "cpapUsageTime",
    "cpapMaskSeal",
    "cpapEventsPerHour",
    "cpapMaskOffCount",
    "cpapNotes",
    "weightDateInput",
    "weightKg",
    "weightWaistCm",
    "weightNotes"
];

export const MEDICAL_BAY_PAIN_TYPE_IDS = [
    "healthPainTypeBurning",
    "healthPainTypeSharp",
    "healthPainTypeAche",
    "healthPainTypeNerve",
    "healthPainTypeStiffness"
];

export const MEDICAL_BAY_METRIC_FIELDS = [
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
