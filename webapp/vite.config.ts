/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

/// <reference types="vite/client" />
/// <reference types="vitest/config" />

import fs from "node:fs";
import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, Plugin } from "vite";

function fullReload(): Plugin {
    return {
        name: "@vitejs/plugin-full-reload",
        handleHotUpdate({ server }) {
            server.ws.send({ type: "full-reload" });

            return [];
        }
    };
}

const DIST_DIR = path.resolve(__dirname, "dist");
function uniChatBuildTools(): Plugin {
    return {
        name: "@unichat/build-tools",
        buildStart() {
            if (fs.existsSync(DIST_DIR)) {
                fs.rmSync(DIST_DIR, { recursive: true, force: true });
            }
        },
        generateBundle(_, bundle) {
            for (const [fileName, chunk] of Object.entries(bundle)) {
                const isVendor = fileName.includes("vendor") || chunk.name === "vendor";
                const isMap = fileName.endsWith(".map");
                if (isVendor && isMap) {
                    delete bundle[fileName];
                }
            }
        }
    };
}

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
    root: path.resolve(__dirname),
    publicDir: path.resolve(__dirname, "public"),
    plugins: [fullReload(), uniChatBuildTools(), react({ plugins: [["@swc/plugin-styled-components", {}]] })],

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
            plugins: [
                visualizer({
                    filename: path.resolve(__dirname, "coverage", "stats.html"),
                    template: "treemap"
                })
            ],
            output: {
                entryFileNames: "js/[name]-[hash].js",
                chunkFileNames: "js/[name]-[hash].js",
                assetFileNames(chunkInfo) {
                    const ext = path.extname(chunkInfo.name!).slice(1);
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
        alias: {
            unichat: path.resolve(__dirname, "src")
        }
    },

    test: {
        globals: true,
        setupFiles: path.resolve(__dirname, "__tests__", "setupTests.ts"),
        environment: "jsdom",
        coverage: {
            provider: "v8",
            reportsDirectory: path.resolve(__dirname, "coverage"),
            reporter: ["text", "html", "clover", "json"],
            include: ["src/**/*.{ts,tsx,js,jsx}"],
            exclude: ["node_modules/", "__tests__", "**/*.d.ts", "**/index.{ts,tsx,js,jsx}"]
        }
    }
});
