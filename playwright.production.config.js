const { defineConfig, devices } = require("@playwright/test");

const productionBaseUrl = process.env.PRODUCTION_BASE_URL
    ? process.env.PRODUCTION_BASE_URL.replace(/\/?$/, "/")
    : undefined;

module.exports = defineConfig({
    testDir: "./tests",
    testMatch: "production-smoke.spec.js",
    use: {
        baseURL: productionBaseUrl,
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
