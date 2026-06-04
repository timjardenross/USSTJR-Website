const SUCCESS_STATUS_TIMEOUT_MS = 5000;

let statusClearTimer = null;

// Success confirmations are transient; info and error messages persist until replaced or cleared.
function cancelStatusClearTimer() {
    if (statusClearTimer !== null) {
        clearTimeout(statusClearTimer);
        statusClearTimer = null;
    }
}

function getSuccessStatusTimeout() {
    if (window.USSTJR_STATUS_TIMEOUT_MS !== undefined) {
        const timeout = Number(window.USSTJR_STATUS_TIMEOUT_MS);

        if (Number.isFinite(timeout) && timeout >= 0) {
            return timeout;
        }
    }

    return SUCCESS_STATUS_TIMEOUT_MS;
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
        }, getSuccessStatusTimeout());
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
