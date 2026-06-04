import { storageGetItem, storageSetItem } from "./storage.js";

export function generateStardate() {
    const today = new Date();

    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const dateKey = `${year}${month}${day}`;
    const counterKey = `usstjr-stardate-${dateKey}`;

    const counter = parseInt(storageGetItem(counterKey) || "1", 10);

    return `${dateKey}.${String(counter).padStart(2, "0")}`;
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
        stardateInput.value = generateStardate();
    }
}

export function setMedicalBayDefaults() {
    const dateInput = document.getElementById("healthDateInput");

    if (dateInput && !dateInput.value) {
        dateInput.value = getLocalDateInputValue(new Date());
    }
}

export function advanceStardateCounter(stardate) {
    const dateKey = stardate.split(".")[0];

    if (!dateKey) {
        return;
    }

    const counterKey = `usstjr-stardate-${dateKey}`;
    const currentCounter = parseInt(storageGetItem(counterKey) || "1", 10);

    storageSetItem(counterKey, String(currentCounter + 1));
}
