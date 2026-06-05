import {
    answerLocalQuery,
    formatComputerResponse
} from "./local-query-engine.js";

export function initialiseComputerCore() {
    const questionInput = document.getElementById("computerQuestionInput");
    const askButton = document.getElementById("askComputerButton");
    const responseArea = document.getElementById("computerResponse");

    if (!questionInput || !askButton || !responseArea) {
        return;
    }

    askButton.addEventListener("click", function () {
        submitComputerCoreQuery(questionInput.value);
    });

    questionInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            submitComputerCoreQuery(questionInput.value);
        }
    });

    document.querySelectorAll("[data-query]").forEach(function (button) {
        button.addEventListener("click", function () {
            const query = button.getAttribute("data-query") || "";
            questionInput.value = query;
            submitComputerCoreQuery(query);
        });
    });
}

export function submitComputerCoreQuery(question) {
    const response = answerLocalQuery(question);

    renderComputerCoreResponse(response);
    speakComputerCoreResponse(response);
}

export function renderComputerCoreResponse(response) {
    const responseArea = document.getElementById("computerResponse");

    if (!responseArea) {
        return;
    }

    responseArea.textContent = "";

    const title = document.createElement("h3");
    title.textContent = response.title;
    responseArea.appendChild(title);

    if (response.empty) {
        response.observation.split("\n").forEach(function (line) {
            const paragraph = document.createElement("p");
            paragraph.textContent = line || " ";
            responseArea.appendChild(paragraph);
        });
        return;
    }

    response.sections.forEach(function (section) {
        const heading = document.createElement("h4");
        const list = document.createElement("ul");

        heading.textContent = section.heading;
        responseArea.appendChild(heading);

        section.items.forEach(function (item) {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            list.appendChild(listItem);
        });

        responseArea.appendChild(list);
    });

    const observationHeading = document.createElement("h4");
    const observation = document.createElement("p");

    observationHeading.textContent = "Observation";
    observation.textContent = response.observation;
    responseArea.appendChild(observationHeading);
    responseArea.appendChild(observation);
}

export function speakComputerCoreResponse(response) {
    const voice = window.USSTJR && window.USSTJR.Voice;

    if (!voice || typeof voice.isEnabled !== "function" || !voice.isEnabled() || typeof voice.speak !== "function") {
        return;
    }

    voice.speak(formatComputerResponse(response));
}
