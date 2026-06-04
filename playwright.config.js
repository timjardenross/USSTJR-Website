const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests",
    use: {
        baseURL: "http://127.0.0.1:4173",
        screenshot: "only-on-failure",
        trace: "on-first-retry"
    },
    webServer: {
        command: "node scripts/static-server.js",
        reuseExistingServer: !process.env.CI,
        url: "http://127.0.0.1:4173"
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
