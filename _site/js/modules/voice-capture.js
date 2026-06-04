let voiceRecognition = null;
let isVoiceCaptureRunning = false;
let saveVoiceDraft = function () {};

export function setVoiceCaptureDraftSaver(saveDraft) {
    saveVoiceDraft = saveDraft;
}

export function getSpeechRecognitionConstructor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
}

export function updateRecordingStatus(message) {
    const statusElement = document.getElementById("recordingStatus");

    if (statusElement) {
        statusElement.textContent = message;
    }
}

export function setVoiceCaptureControlsState() {
    const startButton = document.getElementById("startVoiceCaptureButton");
    const stopButton = document.getElementById("stopVoiceCaptureButton");
    const supportMessage = document.getElementById("voiceCaptureSupportMessage");
    const isSupported = Boolean(getSpeechRecognitionConstructor());

    if (startButton) {
        startButton.disabled = !isSupported || isVoiceCaptureRunning;
    }

    if (stopButton) {
        stopButton.disabled = !isSupported || !isVoiceCaptureRunning;
    }

    if (supportMessage) {
        supportMessage.hidden = isSupported;
    }

    if (!isSupported) {
        updateRecordingStatus("Voice capture unavailable");
    }
}

export function getVoiceCaptureErrorMessage(errorCode) {
    const messages = {
        "audio-capture": "Microphone unavailable",
        "network": "Speech service unavailable",
        "no-speech": "No speech detected",
        "not-allowed": "Microphone permission denied",
        "service-not-allowed": "Speech service permission denied"
    };

    return messages[errorCode] || `Voice capture error: ${errorCode || "unknown"}`;
}

export function startVoiceCapture() {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    const voiceCapture = document.getElementById("voiceCapture");

    if (!SpeechRecognition) {
        updateRecordingStatus("Voice capture unavailable");
        setVoiceCaptureControlsState();
        return;
    }

    if (!voiceCapture) {
        updateRecordingStatus("Voice transcript field unavailable");
        return;
    }

    if (isVoiceCaptureRunning && voiceRecognition) {
        setVoiceCaptureControlsState();
        return;
    }

    voiceRecognition = new SpeechRecognition();
    voiceRecognition.continuous = true;
    voiceRecognition.interimResults = true;
    voiceRecognition.lang = "en-AU";

    let finalTranscript = voiceCapture.value ? `${voiceCapture.value} ` : "";

    voiceRecognition.onresult = function (event) {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += `${transcript} `;
            } else {
                interimTranscript += transcript;
            }
        }

        voiceCapture.value = `${finalTranscript}${interimTranscript}`.trim();
        saveVoiceDraft();
    };

    voiceRecognition.onerror = function (event) {
        updateRecordingStatus(getVoiceCaptureErrorMessage(event.error));
        isVoiceCaptureRunning = false;
        setVoiceCaptureControlsState();
        saveVoiceDraft();
    };

    voiceRecognition.onend = function () {
        isVoiceCaptureRunning = false;
        updateRecordingStatus("Recording stopped");
        setVoiceCaptureControlsState();
        saveVoiceDraft();
    };

    try {
        voiceRecognition.start();
        isVoiceCaptureRunning = true;
        updateRecordingStatus("Recording");
        setVoiceCaptureControlsState();
    } catch (error) {
        console.error("Unable to start voice capture:", error);
        isVoiceCaptureRunning = false;
        updateRecordingStatus("Unable to start voice capture");
        setVoiceCaptureControlsState();
    }
}

export function stopVoiceCapture() {
    if (voiceRecognition && isVoiceCaptureRunning) {
        voiceRecognition.stop();
        isVoiceCaptureRunning = false;
        updateRecordingStatus("Recording stopped");
        setVoiceCaptureControlsState();
        saveVoiceDraft();
    }
}
