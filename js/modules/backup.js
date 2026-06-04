import { BACKUP_VERSION, LATEST_CAPTAINS_LOG_KEY } from "../core/constants.js";
import { getLocalDateInputValue } from "../core/dates.js";
import { downloadTextFile, getFieldValue } from "../core/dom.js";
import { showStatus } from "../core/status.js";
import { storageGetItem, storageRemoveItem, storageSetItem, storageSetJson } from "../core/storage.js";
import {
    getLatestEntry,
    getLogHistory,
    loadLatestEntryToCommandDeck,
    renderRecentLogsToCommandDeck,
    saveLatestEntry,
    saveLogHistory
} from "./command-deck.js";
import { confirmAction } from "./confirm-modal.js";
import { getSavedDraft, restoreDraft } from "./captains-log.js";
import {
    getMedicalBayHistory,
    getSavedMedicalBayDraft,
    loadLatestMedicalEntry,
    renderMedicalHistory,
    restoreMedicalBayData
} from "./medical-bay.js";

export function buildBackup() {
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

export function exportBackup() {
    const backup = buildBackup();
    const filename = `usstjr-backup-${getLocalDateInputValue(new Date())}.json`;

    downloadTextFile(filename, JSON.stringify(backup, null, 2), "application/json");
    showStatus("Backup exported.", "success");
}

export function importBackup(event) {
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

export async function exportEncryptedBackup() {
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

export function importEncryptedBackup(event) {
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

export async function restoreBackup(backup) {
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

export function getBackupPassphrase() {
    return getFieldValue("backupPassphraseInput");
}

export function hasCryptoSupport() {
    return Boolean(window.crypto && window.crypto.subtle && window.crypto.getRandomValues);
}

export async function encryptBackup(backup, passphrase) {
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

export async function decryptBackup(encryptedBackup, passphrase) {
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

export async function deriveEncryptionKey(passphrase, salt) {
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

export function bytesToBase64(bytes) {
    let binary = "";

    bytes.forEach(function (byte) {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}

export function base64ToBytes(value) {
    return Uint8Array.from(atob(value), function (character) {
        return character.charCodeAt(0);
    });
}

export function isValidBackup(backup) {
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

export function isValidLatestEntry(entry) {
    return isPlainObject(entry)
        && isStringValue(entry.stardate)
        && isStringValue(entry.date)
        && isStringValue(entry.mood)
        && isStringValue(entry.energy)
        && isStringValue(entry.pain)
        && isStringValue(entry.stress);
}

export function isValidHistoryEntry(entry) {
    return isPlainObject(entry)
        && isStringValue(entry.id)
        && isStringValue(entry.stardate)
        && isStringValue(entry.date)
        && isStringValue(entry.markdown)
        && isPlainObject(entry.fields)
        && isStringValue(entry.updatedAt);
}

export function isValidStardateCounters(counters) {
    return isPlainObject(counters) && Object.keys(counters).every(function (key) {
        return key.indexOf("usstjr-stardate-") === 0 && isStringValue(String(counters[key]));
    });
}

export function isValidMedicalBayBackup(medicalBay) {
    return isPlainObject(medicalBay)
        && Array.isArray(medicalBay.history)
        && (!medicalBay.draft || isPlainObject(medicalBay.draft))
        && medicalBay.history.every(isValidMedicalBayEntry);
}

export function isValidMedicalBayEntry(entry) {
    return isPlainObject(entry)
        && isStringValue(entry.id)
        && isStringValue(entry.date)
        && Array.isArray(entry.painTypes)
        && (!entry.cpap || isValidCpapEntry(entry.cpap))
        && isStringValue(entry.updatedAt);
}

export function isValidCpapEntry(entry) {
    return isPlainObject(entry)
        && isStringValue(entry.date)
        && isNumberValue(entry.score)
        && isNumberValue(entry.usageMinutes)
        && isNumberValue(entry.maskSeal)
        && isNumberValue(entry.eventsPerHour)
        && isNumberValue(entry.maskOffCount)
        && isStringValue(entry.notes);
}

export function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isStringValue(value) {
    return typeof value === "string";
}

export function isNumberValue(value) {
    return typeof value === "number" && Number.isFinite(value);
}

export function getStardateCounters() {
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

export function restoreStardateCounters(counters) {
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
