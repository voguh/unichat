/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import fs from "node:fs";
import path from "node:path";

import preact from "@preact/preset-vite";
import JSONC from "jsonc-parser";
import { CompilerOptions } from "typescript";
import { defineConfig, Plugin } from "vite";

const tsConfigRaw = fs.readFileSync(path.resolve(__dirname, "tsconfig.json"), { encoding: "utf-8" });
const compilerOptions = (JSONC.parse(tsConfigRaw) || {}).compilerOptions as CompilerOptions;
const tsConfigPaths = Object.entries(compilerOptions?.paths ?? {}).reduce((acc, [key, value]) => {
    const normalizedKey = key.endsWith("/*") ? key.slice(0, -2) : key;
    const normalizedValue = value[0].endsWith("/*") ? value[0].slice(0, -2) : value[0];

    return {
        ...acc,
        [normalizedKey]: path.resolve(__dirname, normalizedValue),
        ...(key.endsWith("/*") && {
            [`${normalizedKey}/*`]: path.resolve(__dirname, `${normalizedValue}/*`)
        })
    };
}, {});

function uniChatBuildTools(): Plugin {
    return {
        name: "@unichat/build-tools",
        handleHotUpdate({ server }) {
            server.ws.send({ type: "full-reload" });

            return [];
        }
    };
}

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
    root: path.resolve(__dirname),
    publicDir: path.resolve(__dirname, "public"),
    plugins: [
        uniChatBuildTools(),
        preact({
            babel: { plugins: [["babel-plugin-macros"], ["babel-plugin-transform-goober"]] },
            devToolsEnabled: false,
            reactAliasesEnabled: false
        })
    ],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,

    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1421,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                  protocol: "ws",
                  host,
                  port: 1421
              }
            : undefined
    },

    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                silenceDeprecations: ["import"]
            }
        }
    },

    build: {
        sourcemap: true,
        rollupOptions: {
            treeshake: true,
            output: {
                entryFileNames: "js/[name]-[hash].js",
                chunkFileNames: "js/[name]-[hash].js",
                assetFileNames(chunkInfo) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const name = chunkInfo.name ?? chunkInfo.fileName ?? "";
                    const ext = path.extname(name).slice(1);
                    if (ext === "css") {
                        return "css/[name]-[hash].[ext]";
                    }

                    if (["png", "jpg", "jpeg", "svg", "gif", "tiff", "bmp", "ico", "webp"].includes(ext)) {
                        return "images/[name]-[hash].[ext]";
                    }

                    if (["woff", "woff2", "eot", "ttf", "otf"].includes(ext)) {
                        return "fonts/[name]-[hash].[ext]";
                    }

                    return "assets/[name]-[hash].[ext]";
                },
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return "vendor";
                    }
                }
            }
        }
    },

    resolve: {
        alias: tsConfigPaths
    }
});
