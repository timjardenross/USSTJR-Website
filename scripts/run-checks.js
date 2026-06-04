const { spawnSync } = require("child_process");

const checks = [
    ["node", ["--check", "js/app.js"]],
    ["node", ["scripts/static-check.js"]],
    ["node", ["scripts/behavior-check.js"]]
];

checks.forEach(function ([command, args]) {
    const result = spawnSync(command, args, {
        encoding: "utf8",
        stdio: "inherit"
    });

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
});

console.log("All checks passed.");
