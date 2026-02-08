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

const tsConfigRaw = fs.readFileSync(path.resolve(__dirname, "tsconfig.json"), { encoding: "utf-8" });
const tsConfig = JSONC.parse(tsConfigRaw) || {};
const tsConfigPaths = Object.entries(tsConfig?.compilerOptions?.paths ?? {}).reduce((acc, [key, value]) => {
    key = key.replace("/*", "");
    value = `<rootDir>/${value[0].replace("/*", "")}`;
    return { ...acc, [key]: value };
}, {});

/** @type {import("jest").Config} */
module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/__tests__/setupTests.ts"],
    transform: {
        "^.+\\.(ts|tsx)$": "babel-jest"
    },
    coverageDirectory: "<rootDir>/coverage",
    collectCoverageFrom: [
        "<rootDir>/src/**/*.{ts,tsx}",
        "!<rootDir>/src/**/*.d.ts",
        "!<rootDir>/src/**/index.{ts,tsx}"
    ],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "\\.(woff|woff2|eot|ttf|otf)$": "<rootDir>/__mocks__/fileMock.js",
        "\\.(png|jpg|jpeg|gif|webp|svg|ico)$": "<rootDir>/__mocks__/fileMock.js",
        ...tsConfigPaths
    }
};
