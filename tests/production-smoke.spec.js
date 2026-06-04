const { test, expect } = require("@playwright/test");

test.beforeAll(function () {
    expect(process.env.PRODUCTION_BASE_URL, "PRODUCTION_BASE_URL must be set for production smoke tests.").toBeTruthy();
});

test("production pages load without runtime errors", async ({ page }) => {
    const errors = [];
    const pages = [
        {
            heading: "USS TJR Command Deck",
            path: "index.html",
            selector: "#exportBackupButton"
        },
        {
            heading: "Captain's Log",
            path: "captains-log.html",
            selector: "#saveCaptainLogButton"
        },
        {
            heading: "Medical Bay",
            path: "medical-bay.html",
            selector: "#saveMedicalLogButton"
        },
        {
            heading: "Computer Core",
            path: "computer-core.html",
            selector: "#askComputerButton"
        }
    ];

    page.on("pageerror", function (error) {
        errors.push(error.message);
    });

    for (const appPage of pages) {
        await page.goto(appPage.path);
        await expect(page.getByRole("heading", { name: appPage.heading })).toBeVisible();
        await expect(page.locator(appPage.selector)).toBeVisible();
        await expect(page.locator("#confirmModal")).toBeHidden();
    }

    await page.goto("version.json");
    await expect(page.locator("body")).toContainText("gitCommitSha");
    expect(errors).toEqual([]);
});
