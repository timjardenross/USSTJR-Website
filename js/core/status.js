export function showStatus(message, type) {
    const statusElement = document.getElementById("appStatus");

    if (!statusElement) {
        return;
    }

    statusElement.textContent = message;
    statusElement.className = `app-status ${type || "info"}`;
    statusElement.hidden = false;
}

export function clearStatus() {
    const statusElement = document.getElementById("appStatus");

    if (statusElement) {
        statusElement.hidden = true;
        statusElement.textContent = "";
        statusElement.className = "app-status";
    }
}
