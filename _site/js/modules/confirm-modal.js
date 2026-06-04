export function confirmAction(message) {
    const modal = document.getElementById("confirmModal");
    const messageElement = document.getElementById("confirmModalMessage");
    const confirmButton = document.getElementById("confirmModalConfirmButton");
    const cancelButton = document.getElementById("confirmModalCancelButton");

    if (!modal || !messageElement || !confirmButton || !cancelButton) {
        return Promise.resolve(confirm(message));
    }

    messageElement.textContent = message;
    modal.hidden = false;
    confirmButton.focus();

    return new Promise(function (resolve) {
        function close(result) {
            modal.hidden = true;
            confirmButton.removeEventListener("click", confirmHandler);
            cancelButton.removeEventListener("click", cancelHandler);
            modal.removeEventListener("keydown", keydownHandler);
            resolve(result);
        }

        function confirmHandler() {
            close(true);
        }

        function cancelHandler() {
            close(false);
        }

        function keydownHandler(event) {
            if (event.key === "Escape") {
                close(false);
            }
        }

        confirmButton.addEventListener("click", confirmHandler);
        cancelButton.addEventListener("click", cancelHandler);
        modal.addEventListener("keydown", keydownHandler);
    });
}
