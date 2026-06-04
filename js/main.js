import { setMedicalBayDefaults, setTodayDefaults } from "./core/dates.js";
import { bindClick } from "./core/dom.js";
import {
    clearLogHistory,
    loadLatestEntryToCommandDeck,
    renderRecentLogsToCommandDeck
} from "./modules/command-deck.js";
import {
    clearDraftAndResetForm,
    copyLog,
    downloadLog,
    generateLog,
    loadDraft,
    loadHistoryEntryFromUrl,
    saveCaptainLog,
    saveCommandDeckStatus,
    saveDraft,
    setupDraftAutosave,
    setupStardateAutomation
} from "./modules/captains-log.js";
import {
    downloadMedicalBayLog,
    loadLatestMedicalEntry,
    loadMedicalBayDraft,
    renderMedicalHistory,
    resetMedicalBayForm,
    saveMedicalBayLog,
    setupMedicalBayAutosave
} from "./modules/medical-bay.js";
import {
    exportBackup,
    exportEncryptedBackup,
    importBackup,
    importEncryptedBackup
} from "./modules/backup.js";
import {
    setVoiceCaptureControlsState,
    setVoiceCaptureDraftSaver,
    startVoiceCapture,
    stopVoiceCapture
} from "./modules/voice-capture.js";

export function initialiseApp() {
    setTodayDefaults();
    setMedicalBayDefaults();
    loadDraft();
    loadMedicalBayDraft();
    loadHistoryEntryFromUrl();
    setupActionHandlers();
    setVoiceCaptureDraftSaver(saveDraft);
    setVoiceCaptureControlsState();
    setupDraftAutosave();
    setupStardateAutomation();
    setupMedicalBayAutosave();
    loadLatestEntryToCommandDeck();
    renderRecentLogsToCommandDeck();
    loadLatestMedicalEntry();
    renderMedicalHistory();
}

export function setupActionHandlers() {
    bindClick("startVoiceCaptureButton", startVoiceCapture);
    bindClick("stopVoiceCaptureButton", stopVoiceCapture);
    bindClick("saveCaptainLogButton", saveCaptainLog);
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

// Expose functions globally for inline scripts (e.g., voice command action registration)
window.startVoiceCapture = startVoiceCapture;
window.stopVoiceCapture = stopVoiceCapture;
window.downloadLog = downloadLog;
window.clearDraftAndResetForm = clearDraftAndResetForm;

window.addEventListener("DOMContentLoaded", initialiseApp);
