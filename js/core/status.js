const SUCCESS_STATUS_TIMEOUT_MS = 5000;

let statusClearTimer = null;

// Success confirmations are transient; info and error messages persist until replaced or cleared.
function cancelStatusClearTimer() {
    if (statusClearTimer !== null) {
        clearTimeout(statusClearTimer);
        statusClearTimer = null;
    }
}

export function showStatus(message, type) {
    const statusElement = document.getElementById("appStatus");
    const statusType = type || "info";

    if (!statusElement) {
        return;
    }

    cancelStatusClearTimer();
    statusElement.textContent = message;
    statusElement.className = `app-status ${statusType}`;
    statusElement.hidden = false;

    if (statusType === "success") {
        statusClearTimer = setTimeout(function () {
            statusClearTimer = null;
            clearStatus();
        }, SUCCESS_STATUS_TIMEOUT_MS);
    }
}

export function clearStatus() {
    const statusElement = document.getElementById("appStatus");

    cancelStatusClearTimer();

    if (statusElement) {
        statusElement.hidden = true;
        statusElement.textContent = "";
        statusElement.className = "app-status";
    }
}
