const { execSync } = require("node:child_process");
const fs = require("node:fs");

const protectedBranches = ["development"];

const branch = execSync("git branch --show-current").toString().trim() || null;

console.log(`Current branch: ${branch}`);

if (!branch || !protectedBranches.includes(branch)) {
    console.log("Non-protected branch → skipping pre-push checks");
    process.exit(0);
}

console.log("Protected branch detected → running pre-push checks...");

try {
    const upstream = execSync(`git rev-parse --abbrev-ref ${branch}@{upstream}`).toString().trim() || null;
    const changedFiles =
        execSync(`git diff --name-only --diff-filter=AMR ${upstream}...${branch}`)
            .toString()
            .trim()
            .split("\n")
            .filter(Boolean) || [];
    let buildTargets = changedFiles;
    if (changedFiles.some(file => file.startsWith("src/common/"))) {
        buildTargets = fs
            .readdirSync("src/plugins", { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    }

    execSync("npm run lint", { stdio: "inherit" });
    execSync(`npm run build -- ${buildTargets.join(" ")}`, { stdio: "inherit" });
    console.log("");
    console.log("Pre-push checks passed");
    console.log("");
    process.exit(0);
} catch {
    console.log("");
    console.log("Push aborted. Fix issues before pushing to protected branches");
    console.log("");
    process.exit(1);
}
