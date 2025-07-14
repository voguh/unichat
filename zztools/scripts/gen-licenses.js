import childProcess from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { logger } from "./utils/logger.js";

const ROOT_DIR = path.resolve(__dirname, "..");
const WEBAPP_DIR = path.resolve(__dirname, "..", "webapp");

/**
 * @param {string} command
 * @param {childProcess.ExecSyncOptions} options
 * @returns {string}
 */
function execSync(command, options = { cwd: ROOT_DIR }) {
    options = { shell: true, stdio: "pipe", ...options }
    return childProcess.execSync(command, options);
}

async function main() {
    const cargoTomlPath = path.join(ROOT_DIR, 'Cargo.toml');
    const pkgJsonPath = path.join(WEBAPP_DIR, 'package.json');

    execSync("cargo install cargo-license --locked", { stdio: "inherit" });
    const cargoOut = execSync("cargo license --direct-deps-only --do-not-bundle --json");
    const cargoLicenses = JSON.parse(cargoOut);
    logger.info('Found {} Cargo licenses.', cargoLicenses.length);

    const pkgOut = execSync("pnpx license-checker --production --json", { cwd: WEBAPP_DIR });
    const npmLicenses = JSON.parse(pkgOut);
    logger.info(`Found ${Object.keys(npmLicenses).length} NPM licenses.`);

    const licenses = [
        ...cargoLicenses.filter(pkg => pkg.name !== "unichat").map(pkg => ({
            source: "crate",
            name: pkg.name,
            version: pkg.version,
            authors: (pkg.authors ?? "").split("|"),
            repository: `https://crates.io/crates/${pkg.name}/${pkg.version}`,
            licenses: pkg.license.split(" OR ")
        })),
        ...Object.entries(npmLicenses).filter(([pkg]) => pkg !== "unichat").map(([pkg, data]) => {
            const nameVersion = pkg.split("@");
            const version = nameVersion.at(-1);
            const name = pkg.replace(`@${version}`, '');

            return ({
                source: "npm",
                name: name,
                version: version,
                authors: (data.publisher ?? "").split("|"),
                repository: `https://npmjs.com/package/${name}/v/${version}`,
                licenses: data.licenses.split(" OR ")
            })
        })
    ];

    licenses.sort((a, b) => `${a.source}:${a.name}`.localeCompare(`${b.source}:${b.name}`));

    logger.info(`Found ${licenses.length} total licenses.`);
    const outDir = path.resolve(ROOT_DIR, 'target', 'gen');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const outputPath = path.resolve(outDir, 'third_party_licenses.json');
    fs.writeFileSync(outputPath, JSON.stringify(licenses));
    logger.info(`Wrote licenses to ${outputPath}`);
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    })
