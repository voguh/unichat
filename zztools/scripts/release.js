import childProcess, { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import semver from "https://esm.sh/semver@7.7.2";
import TOML from "https://esm.sh/@iarna/toml@2.2.5";

import { logger } from "./utils/logger.js";
import { Strings } from "./utils/Strings.js";
import { confirm } from "./utils/util.js";

const ROOT_DIR = path.resolve(__dirname, "..");
const WEBAPP_DIR = path.resolve(__dirname, "..", "webapp");

/**
 * @param {string} command
 * @param {childProcess.ExecSyncOptions} options
 * @returns {string}
 */
function execSync(command, options = { cwd: ROOT_DIR }) {
    options = { shell: true, stdio: "inherit", ...options }
    return childProcess.execSync(command, options);
}

function normalizeVersion(version) {
    const newVersion = semver.valid(version);
    if (Strings.isNullOrEmpty(newVersion)) {
        logger.error("Invalid version format. Please provide a valid semantic version (e.g., 1.0.0).");
        throw new Error("Invalid version format");
    }

    const prerelease = semver.prerelease(newVersion) ?? [];
    if (prerelease.length > 0) {
        if (["alpha", "beta", "rc"].includes(prerelease[0])) {
            if (prerelease[1] != null && typeof prerelease[1] !== "number") {
                logger.error("Invalid prerelease identifier '{}'. It should be a number.", prerelease[1]);
                throw new Error("Invalid prerelease identifier");
            }

            prerelease[1] = (prerelease[1] ?? 0);
        } else {
            logger.error("Invalid prerelease identifier '{}'. Only 'alpha', 'beta', or 'rc' are allowed.", prerelease[0]);
            throw new Error("Invalid prerelease identifier");
        }
    }

    const major = semver.major(newVersion);
    const minor = semver.minor(newVersion);
    const patch = semver.patch(newVersion);
    const prereleaseSuffix = prerelease.length > 0 ? `-${prerelease.join(".")}` : "";
    return `${major}.${minor}.${patch}${prereleaseSuffix}`;
}

async function main(args) {
    const { positionals } = parseArgs({ allowPositionals: true, args })
    let rawNewVersion = positionals[0];
    let newVersion = normalizeVersion(rawNewVersion);

    const answer = await confirm("Are you sure you want to release version {}?", newVersion);
    if (answer === false) {
        logger.info("Release cancelled.");
        process.exit(0);
    } else {
        logger.info("Starting release process for version {}", newVersion);
    }

    const cargoTomlPath = path.resolve(ROOT_DIR, "Cargo.toml");
    const cargoRaw = fs.readFileSync(cargoTomlPath, "utf-8");
    const currentVersion = TOML.parse(cargoRaw).package.version;

    logger.info("Checking '\x1b[33mCargo.toml\x1b[0m' current version...");
    if (!semver.gt(newVersion, currentVersion)) {
        logger.error("New version '{}' must be greater than the current version '{}'.", newVersion, currentVersion);
        process.exit(1);
    }

    logger.info("Updating version from '{}' to '{}'.", currentVersion, newVersion);
    const newCargoRaw = cargoRaw.replace(`version = "${currentVersion}"`, `version = "${newVersion}"`);
    fs.writeFileSync(cargoTomlPath, newCargoRaw, "utf-8");

    logger.info("Running tests and building project...");
    execSync("pnpm install --frozen-lockfile", { cwd: WEBAPP_DIR });
    execSync("pnpm test run --passWithNoTests", { cwd: WEBAPP_DIR });
    execSync("pnpm build:ui", { cwd: WEBAPP_DIR });
    execSync("cargo test --all-targets --all-features");
    execSync("cargo tauri build");

    logger.info("Committing changes...");
    execSync(`git add ${cargoTomlPath} ${path.resolve(ROOT_DIR, "Cargo.lock")}`);
    execSync(`git commit -m "chore: release version ${newVersion}"`);
    execSync(`git tag -a "${newVersion}" -m "${newVersion}"`);
    execSync("git push origin main --tags");
}

main(process.argv.slice(2))
    .then(() => process.exit(0))
    .catch(err => {
        logger.error("An error occurred: {}", err);
        process.exit(1);
    })
