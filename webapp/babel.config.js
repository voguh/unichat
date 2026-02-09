/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const JSONC = require("jsonc-parser");

const isDev = process.env.NODE_ENV === "development";
const isWebpack = process.argv.some((arg) => arg.includes("webpack"));

const tsConfigRaw = fs.readFileSync(path.resolve(__dirname, "tsconfig.json"), { encoding: "utf-8" });
const tsConfig = JSONC.parse(tsConfigRaw) || {};
const tsConfigPaths = Object.entries(tsConfig?.compilerOptions?.paths ?? {}).reduce((acc, [key, value]) => {
    return {
        ...acc,
        [key.replace("/*", "")]: value[0].replace("/*", "")
    };
}, {});

const predefinedPlugins = [["styled-components", { ssr: false, displayName: isDev }]];

if (!isWebpack) {
    predefinedPlugins.push(["module-resolver", { cwd: path.resolve(__dirname), alias: tsConfigPaths }]);
}

module.exports = {
    comments: false,
    presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
    plugins: predefinedPlugins,
    ignore: ["**/*.d.ts"]
};
