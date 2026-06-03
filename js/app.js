js
└── app.js
function generateStardate() {
    const today = new Date();

    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}${month}${day}.01`;
}

function setTodayDefaults() {
    const today = new Date();

    const dateInput = document.getElementById("dateInput");
    const stardateInput = document.getElementById("stardateInput");

    if (dateInput) {
        dateInput.value = today.toISOString().split("T")[0];
    }

    if (stardateInput) {
        stardateInput.value = generateStardate();
    }
}

window.addEventListener("DOMContentLoaded", setTodayDefaults);

function generateLog() {

    const stardate = document.getElementById("stardateInput").value;
    const date = document.getElementById("dateInput").value;

    const mood = document.getElementById("mood").value;
    const energy = document.getElementById("energy").value;
    const pain = document.getElementById("pain").value;
    const stress = document.getElementById("stress").value;

    const wins = document.getElementById("wins").value;
    const challenges = document.getElementById("challenges").value;
    const lessons = document.getElementById("lessons").value;
    const gratitude = document.getElementById("gratitude").value;

    const health = document.getElementById("health").value;
    const career = document.getElementById("career").value;
    const mindbody = document.getElementById("mindbody").value;

    const priority1 = document.getElementById("priority1").value;
    const priority2 = document.getElementById("priority2").value;
    const priority3 = document.getElementById("priority3").value;

    const markdown = `# Stardate ${stardate}

Date: ${date}

## Status

Mood: ${mood}
Energy: ${energy}
Pain: ${pain}
Stress: ${stress}

## Today's Wins

${wins}

## Challenges

${challenges}

## Lessons Learned

${lessons}

## Gratitude

${gratitude}

## Mission Progress

### Health

${health}

### Career

${career}

### TJR Mind Body

${mindbody}

## Tomorrow's Priorities

1. ${priority1}
2. ${priority2}
3. ${priority3}
`;

    document.getElementById("markdownOutput").value = markdown;
}

function copyLog() {

    const output = document.getElementById("markdownOutput");

    output.select();
    output.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(output.value);

    alert("Captain's Log copied to clipboard.");
}