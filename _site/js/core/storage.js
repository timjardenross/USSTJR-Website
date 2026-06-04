import { showStatus } from "./status.js";

export function storageGetItem(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Unable to read localStorage key ${key}:`, error);
        showStatus("Local browser storage is unavailable.", "error");
        return null;
    }
}

export function storageSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error(`Unable to write localStorage key ${key}:`, error);
        showStatus("Unable to save data in this browser. Export a backup if possible.", "error");
        return false;
    }
}

export function storageRemoveItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Unable to remove localStorage key ${key}:`, error);
        showStatus("Unable to update local browser storage.", "error");
        return false;
    }
}

export function storageGetJson(key, fallbackValue) {
    const savedValue = storageGetItem(key);

    if (!savedValue) {
        return fallbackValue;
    }

    try {
        return JSON.parse(savedValue);
    } catch (error) {
        console.error(`Unable to parse localStorage key ${key}:`, error);
        storageRemoveItem(key);
        return fallbackValue;
    }
}

export function storageSetJson(key, value) {
    return storageSetItem(key, JSON.stringify(value));
}
