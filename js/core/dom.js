export function bindClick(elementId, handler) {
    const element = document.getElementById(elementId);

    if (element) {
        element.addEventListener("click", handler);
    }
}

export function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value : "";
}

export function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);

    if (field) {
        field.value = value || "";
    }
}

export function setTextContent(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

export function downloadTextFile(filename, text, type) {
    const blob = new Blob([text], {
        type: type
    });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}
