import { VOICE_ENABLED_KEY } from "../core/constants.js";
import { storageGetItem, storageSetItem } from "../core/storage.js";

export function isVoiceEnabled() {
    return storageGetItem(VOICE_ENABLED_KEY) === "on";
}

export function setVoiceEnabled(enabled) {
    storageSetItem(VOICE_ENABLED_KEY, enabled ? "on" : "off");
}

export function voiceSpeak(phrase) {
    if (!isVoiceEnabled()) {
        return;
    }

    const voice = window.USSTJR && window.USSTJR.Voice;

    if (voice && typeof voice.speak === "function") {
        voice.speak(phrase);
    }
}

export function voiceAcknowledgePain(level) {
    if (!isVoiceEnabled()) {
        return;
    }

    const voice = window.USSTJR && window.USSTJR.Voice;

    if (voice && typeof voice.acknowledgePain === "function") {
        voice.acknowledgePain(level);
    }
}

export function voiceAcknowledgeEnergy(level) {
    if (!isVoiceEnabled()) {
        return;
    }

    const voice = window.USSTJR && window.USSTJR.Voice;

    if (voice && typeof voice.acknowledgeEnergy === "function") {
        voice.acknowledgeEnergy(level);
    }
}

export function voiceAcknowledgeMood(level) {
    if (!isVoiceEnabled()) {
        return;
    }

    const voice = window.USSTJR && window.USSTJR.Voice;

    if (voice && typeof voice.acknowledgeMood === "function") {
        voice.acknowledgeMood(level);
    }
}

export function voicePhrases() {
    const voice = window.USSTJR && window.USSTJR.Voice;
    return (voice && voice.phrases) || {};
}

export function setupVoiceToggle() {
    const toggle = document.getElementById("voiceOutputToggle");

    if (!toggle) {
        return;
    }

    toggle.checked = isVoiceEnabled();

    toggle.addEventListener("change", function () {
        setVoiceEnabled(toggle.checked);
    });
}
