const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests",
    testMatch: "production-smoke.spec.js",
    use: {
        baseURL: process.env.PRODUCTION_BASE_URL,
        screenshot: "only-on-failure",
        trace: "on-first-retry"
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"]
            }
        }
    ]
});
