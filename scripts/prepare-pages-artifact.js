const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "_site");
const filesToCopy = [
    "index.html",
    "captains-log.html",
    "medical-bay.html",
    "README.md",
    "BACKLOG.md",
    "MEDICAL_BAY_SCOPE.md"
];
const directoriesToCopy = [
    "css",
    "js",
    "docs"
];

function removeDirectory(directoryPath) {
    fs.rmSync(directoryPath, {
        force: true,
        recursive: true
    });
}

function ensureDirectory(directoryPath) {
    fs.mkdirSync(directoryPath, {
        recursive: true
    });
}

function copyFile(relativePath) {
    const source = path.join(root, relativePath);
    const target = path.join(outputDir, relativePath);

    if (!fs.existsSync(source)) {
        return;
    }

    ensureDirectory(path.dirname(target));
    fs.copyFileSync(source, target);
}

function copyDirectory(relativePath) {
    const source = path.join(root, relativePath);
    const target = path.join(outputDir, relativePath);

    if (!fs.existsSync(source)) {
        return;
    }

    fs.cpSync(source, target, {
        recursive: true
    });
}

function writeDeploymentMetadata() {
    const metadata = {
        buildVersion: process.env.GITHUB_RUN_NUMBER || "local",
        deploymentDate: new Date().toISOString(),
        gitCommitSha: process.env.GITHUB_SHA || "local",
        repository: process.env.GITHUB_REPOSITORY || "local"
    };

    fs.writeFileSync(path.join(outputDir, "version.json"), `${JSON.stringify(metadata, null, 2)}\n`);
    fs.writeFileSync(path.join(outputDir, ".nojekyll"), "");
}

removeDirectory(outputDir);
ensureDirectory(outputDir);
filesToCopy.forEach(copyFile);
directoriesToCopy.forEach(copyDirectory);
writeDeploymentMetadata();

console.log(`Prepared GitHub Pages artifact at ${outputDir}`);
