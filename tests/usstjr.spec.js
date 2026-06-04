const fs = require("fs/promises");
const { test, expect } = require("@playwright/test");

async function clearStorage(page) {
    await page.goto("/index.html");
    await page.evaluate(function () {
        localStorage.clear();
    });
}

async function expectNoPageErrors(page, action) {
    const errors = [];
    page.on("pageerror", function (error) {
        errors.push(error.message);
    });

    await action();
    expect(errors).toEqual([]);
}

async function fillCaptainsLog(page, values = {}) {
    await page.goto("/captains-log.html");
    if (values.stardate) {
        await page.fill("#stardateInput", values.stardate);
    }
    await page.fill("#dateInput", values.date || "2026-06-04");
    await page.fill("#mood", values.mood || "8");
    await page.fill("#energy", values.energy || "7");
    await page.fill("#pain", values.pain || "2");
    await page.fill("#stress", values.stress || "3");
    await page.fill("#wins", values.wins || "E2E win logged");
    await page.fill("#challenges", values.challenges || "E2E challenge logged");
    await page.fill("#lessons", values.lessons || "E2E lesson logged");
    await page.fill("#gratitude", values.gratitude || "E2E gratitude logged");
    await page.fill("#health", values.health || "E2E health progress");
    await page.fill("#career", values.career || "E2E career progress");
    await page.fill("#mindbody", values.mindbody || "E2E mind body progress");
    await page.fill("#priority1", values.priority1 || "Priority one");
    await page.fill("#priority2", values.priority2 || "Priority two");
    await page.fill("#priority3", values.priority3 || "Priority three");
}

async function saveCaptainsLog(page, values = {}) {
    await fillCaptainsLog(page, values);
    await page.click("#saveCaptainLogButton");
    await expect(page.locator("#markdownOutput")).toHaveValue(new RegExp(values.wins || "E2E win logged"));
    await expect(page.locator("#appStatus")).toContainText("saved");
}

async function fillMedicalBay(page, values = {}) {
    await page.goto("/medical-bay.html");
    await page.fill("#healthDateInput", values.date || "2026-06-04");
    await page.fill("#healthOverallPain", values.overallPain || "5");
    await page.fill("#healthBestPain", values.bestPain || "3");
    await page.fill("#healthWorstPain", values.worstPain || "7");
    await page.fill("#healthPainLocation", values.painLocation || "Hip and SIJ");
    await page.check("#healthPainTypeNerve");
    await page.fill("#healthMood", values.mood || "7");
    await page.fill("#healthAnxiety", values.anxiety || "4");
    await page.fill("#healthStress", values.stress || "3");
    await page.fill("#healthSleepHours", values.sleepHours || "6.5");
    await page.fill("#healthSleepQuality", values.sleepQuality || "6");
    await page.fill("#healthWakeups", values.wakeups || "2");
    await page.fill("#healthEnergy", values.energy || "6");
    await page.fill("#healthFatigue", values.fatigue || "5");
    await page.fill("#healthObservations", values.observations || "Hip felt tighter in the afternoon");
    await page.fill("#healthActivities", values.activities || "Short walk");
    await page.fill("#healthTriggers", values.triggers || "Long sitting block");
    await page.fill("#healthWins", values.wins || "Completed physio");
    await page.fill("#healthChallenges", values.challenges || "Pain flare after sitting");
}

async function saveMedicalBayLog(page, values = {}) {
    await fillMedicalBay(page, values);
    await page.click("#saveMedicalLogButton");
    await expect(page.locator("#medicalSummaryOutput")).toHaveValue(/Health Intelligence/);
    await expect(page.locator("#appStatus")).toContainText("saved");
}

test.beforeEach(async ({ page }) => {
    await clearStorage(page);
});

test("Command Deck loads correctly", async ({ page }) => {
    await expectNoPageErrors(page, async function () {
        await page.goto("/index.html");
        await expect(page.getByRole("heading", { name: "USS TJR Command Deck" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Command Status" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Captain's Log" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Medical Bay" })).toBeVisible();
        await expect(page.locator("#confirmModal")).toBeHidden();
    });
});

test("Captain's Log core workflow updates Command Deck", async ({ page }) => {
    await page.goto("/captains-log.html");
    await expect(page.locator("#saveCaptainLogButton")).toHaveText("Save Captain's Log");
    await expect(page.locator("#generateLogButton")).toHaveText("Preview Markdown");

    await saveCaptainsLog(page, {
        mood: "9",
        energy: "6",
        pain: "4",
        stress: "2",
        wins: "E2E captain workflow win"
    });

    await expect(page.locator("#markdownOutput")).toHaveValue(/Stardate/);
    await expect(page.locator("#markdownOutput")).toHaveValue(/E2E captain workflow win/);

    await page.goto("/index.html");
    await expect(page.locator("#latestMood")).toHaveText("9");
    await expect(page.locator("#latestEnergy")).toHaveText("6");
    await expect(page.locator("#latestPain")).toHaveText("4");
    await expect(page.locator("#latestStress")).toHaveText("2");
});

test("Captain's Log auto-calculates and increments stardates", async ({ page }) => {
    await page.goto("/captains-log.html");
    await expect(page.locator("#stardateInput")).toHaveValue(/^\d{6}\.\d{2}$/);

    await page.fill("#stardateInput", "");
    await page.fill("#dateInput", "2026-06-05");
    await expect(page.locator("#stardateInput")).toHaveValue("260605.01");

    await saveCaptainsLog(page, {
        date: "2026-06-04",
        mood: "8",
        energy: "7",
        pain: "2",
        stress: "3",
        wins: "First stardate e2e"
    });
    await expect(page.locator("#stardateInput")).toHaveValue("260604.01");

    await page.fill("#stardateInput", "");
    await page.fill("#dateInput", "2026-06-04");
    await expect(page.locator("#stardateInput")).toHaveValue("260604.02");
    await saveCaptainsLog(page, {
        date: "2026-06-04",
        mood: "8",
        energy: "7",
        pain: "2",
        stress: "3",
        wins: "Second stardate e2e"
    });
    await expect(page.locator("#stardateInput")).toHaveValue("260604.02");

    await page.click("#resetFormButton");
    await page.click("#confirmModalConfirmButton");
    await expect(page.locator("#stardateInput")).toHaveValue(/^\d{6}\.\d{2}$/);
});

test("Captain's Log reset confirmation preserves or clears draft", async ({ page }) => {
    await page.goto("/captains-log.html");
    await page.fill("#wins", "Draft should survive cancel");

    await expect(page.locator("#confirmModal")).toBeHidden();
    await page.click("#resetFormButton");
    await expect(page.locator("#confirmModal")).toBeVisible();
    await expect(page.locator("#confirmModalMessage")).toContainText("Clear this Captain's Log draft?");
    await page.click("#confirmModalCancelButton");
    await expect(page.locator("#wins")).toHaveValue("Draft should survive cancel");

    await page.click("#resetFormButton");
    await page.click("#confirmModalConfirmButton");
    await expect(page.locator("#wins")).toHaveValue("");
});

test("Medical Bay core workflow saves health intelligence", async ({ page }) => {
    await saveMedicalBayLog(page, {
        overallPain: "5",
        sleepHours: "6.5",
        energy: "6",
        stress: "3",
        triggers: "E2E long sitting trigger"
    });

    await expect(page.locator("#medicalSummaryOutput")).toHaveValue(/E2E long sitting trigger/);
    await expect(page.locator("#medicalHistoryList")).toContainText("2026-06-04");
    await expect(page.locator("#medicalLatestPain")).toHaveText("5");
    await expect(page.locator("#medicalLatestSleep")).toHaveText("6.5");
    await expect(page.locator("#medicalLatestEnergy")).toHaveText("6");
    await expect(page.locator("#medicalLatestStress")).toHaveText("3");
});

test("Medical Bay reset confirmation preserves or clears draft", async ({ page }) => {
    await page.goto("/medical-bay.html");
    await page.fill("#healthTriggers", "Draft trigger should survive cancel");

    await page.click("#resetMedicalLogButton");
    await expect(page.locator("#confirmModal")).toBeVisible();
    await page.click("#confirmModalCancelButton");
    await expect(page.locator("#healthTriggers")).toHaveValue("Draft trigger should survive cancel");

    await page.click("#resetMedicalLogButton");
    await page.click("#confirmModalConfirmButton");
    await expect(page.locator("#healthTriggers")).toHaveValue("");
});

test("Backup export and import include Captain's Log and Medical Bay data", async ({ page }, testInfo) => {
    await saveCaptainsLog(page, {
        wins: "E2E backup captain win"
    });
    await saveMedicalBayLog(page, {
        triggers: "E2E backup health trigger"
    });

    await page.goto("/index.html");
    const downloadPromise = page.waitForEvent("download");
    await page.click("#exportBackupButton");
    const download = await downloadPromise;
    const backupPath = await download.path();
    const backup = JSON.parse(await fs.readFile(backupPath, "utf8"));

    expect(backup.version).toBeTruthy();
    expect(Array.isArray(backup.logHistory)).toBe(true);
    expect(backup.logHistory[0].markdown).toContain("E2E backup captain win");
    expect(backup.draft.wins).toBe("E2E backup captain win");
    expect(Array.isArray(backup.medicalBay.history)).toBe(true);
    expect(backup.medicalBay.history[0].triggers).toBe("E2E backup health trigger");
    expect(backup.medicalBay.draft.healthTriggers).toBe("E2E backup health trigger");

    const importPath = testInfo.outputPath("usstjr-backup.json");
    await fs.writeFile(importPath, JSON.stringify(backup, null, 2));
    await page.evaluate(function () {
        localStorage.clear();
    });
    await page.setInputFiles("#importBackupInput", importPath);
    await expect(page.locator("#confirmModal")).toBeVisible();
    await page.click("#confirmModalConfirmButton");
    await expect(page.locator("#latestEntryStardate")).toHaveText("260604.01");

    await page.goto("/medical-bay.html");
    await expect(page.locator("#medicalLatestPain")).toHaveText("5");
    await expect(page.locator("#medicalHistoryList")).toContainText("2026-06-04");
});

test("Browser module load smoke test", async ({ page }) => {
    const pages = [
        {
            heading: "USS TJR Command Deck",
            path: "/index.html",
            selector: "#exportBackupButton"
        },
        {
            heading: "Captain's Log",
            path: "/captains-log.html",
            selector: "#saveCaptainLogButton"
        },
        {
            heading: "Medical Bay",
            path: "/medical-bay.html",
            selector: "#saveMedicalLogButton"
        }
    ];

    for (const appPage of pages) {
        await expectNoPageErrors(page, async function () {
            await page.goto(appPage.path);
            await expect(page.getByRole("heading", { name: appPage.heading })).toBeVisible();
            await expect(page.locator(appPage.selector)).toBeVisible();
        });
    }
});
