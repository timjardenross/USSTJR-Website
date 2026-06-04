import { storageGetItem, storageSetItem } from "./storage.js";

export function generateStardate(dateValue) {
    const dateKey = getStardateDateKey(dateValue || getLocalDateInputValue(new Date()));
    const counterKey = getStardateCounterKey(dateKey);
    const counter = parseInt(storageGetItem(counterKey) || "1", 10);

    return formatStardate(dateKey, counter);
}

export function generateNextStardateForDate(dateValue, existingStardates) {
    const dateKey = getStardateDateKey(dateValue || getLocalDateInputValue(new Date()));
    const counterKey = getStardateCounterKey(dateKey);
    const storedCounter = parseInt(storageGetItem(counterKey) || "1", 10);
    const historyCounter = getNextSequenceFromExistingStardates(dateKey, existingStardates || []);
    const nextCounter = Math.max(storedCounter, historyCounter);

    return formatStardate(dateKey, nextCounter);
}

export function getStardateDateKey(dateValue) {
    const parts = String(dateValue || getLocalDateInputValue(new Date())).split("-");

    if (parts.length === 3) {
        return `${parts[0].slice(-2)}${parts[1].padStart(2, "0")}${parts[2].padStart(2, "0")}`;
    }

    const today = new Date();
    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}${month}${day}`;
}

export function getStardateCounterKey(dateKey) {
    return `usstjr-stardate-${dateKey}`;
}

export function formatStardate(dateKey, counter) {
    return `${dateKey}.${String(counter).padStart(2, "0")}`;
}

export function getNextSequenceFromExistingStardates(dateKey, stardates) {
    const highestSequence = stardates.reduce(function (highest, stardate) {
        const parts = String(stardate || "").split(".");

        if (parts[0] !== dateKey) {
            return highest;
        }

        const sequence = parseInt(parts[1] || "0", 10);
        return Number.isFinite(sequence) ? Math.max(highest, sequence) : highest;
    }, 0);

    return highestSequence + 1;
}

export function getLocalDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function setTodayDefaults() {
    const today = new Date();

    const dateInput = document.getElementById("dateInput");
    const stardateInput = document.getElementById("stardateInput");

    if (dateInput && !dateInput.value) {
        dateInput.value = getLocalDateInputValue(today);
    }

    if (stardateInput && !stardateInput.value) {
        stardateInput.value = generateStardate(dateInput ? dateInput.value : "");
    }
}

export function setMedicalBayDefaults() {
    const today = getLocalDateInputValue(new Date());
    const dateInput = document.getElementById("healthDateInput");
    const cpapDateInput = document.getElementById("cpapDateInput");
    const weightDateInput = document.getElementById("weightDateInput");

    if (dateInput && !dateInput.value) {
        dateInput.value = today;
    }

    if (cpapDateInput && !cpapDateInput.value) {
        cpapDateInput.value = today;
    }

    if (weightDateInput && !weightDateInput.value) {
        weightDateInput.value = today;
    }
}

export function advanceStardateCounter(stardate) {
    const dateKey = stardate.split(".")[0];

    if (!dateKey) {
        return;
    }

    const counterKey = getStardateCounterKey(dateKey);
    const currentCounter = parseInt(storageGetItem(counterKey) || "1", 10);
    const stardateSequence = parseInt(stardate.split(".")[1] || "0", 10);
    const nextCounter = Math.max(currentCounter + 1, stardateSequence + 1);

    storageSetItem(counterKey, String(nextCounter));
}
