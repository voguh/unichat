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
import { glob } from "glob";
import JSONC from "jsonc-parser";
import sonda from "sonda/vite";
import { CompilerOptions } from "typescript";
import { defineConfig, Plugin, PluginOption } from "vite";
import { ViteMinifyPlugin as minifyPlugin } from "vite-plugin-minify";

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
    const cwd = path.resolve(__dirname);

    const allFiles = new Set<string>();
    const importedFiles = new Set<string>();

    return {
        name: "@unichat/build-tools",
        async buildStart(_inputOptions) {
            const files = await glob("./src/**/*.{js,ts,tsx,jsx}", { cwd });
            for (const file of files) {
                if ([".d.ts", ".test.ts", ".spec.ts"].some((ext) => file.endsWith(ext))) {
                    continue;
                }

                allFiles.add(path.resolve(cwd, file));
            }
        },
        load(id, _options) {
            if (allFiles.has(id.split("?")[0])) {
                importedFiles.add(id.split("?")[0]);
            }
        },
        buildEnd(_error) {
            const orphanFiles = Array.from(allFiles).filter((file) => !importedFiles.has(file));

            if (orphanFiles.length > 0) {
                const logLines = ["╔══ Orphan files detected ══════════════════════════════════════════════════════"];

                for (const file of orphanFiles.sort()) {
                    const relativePath = path.relative(cwd, file);
                    logLines.push(`║  ./${relativePath}`);
                }

                logLines.push("╚══════════════════════════════════════════════════════════════════════════════");
                this.info(logLines.join("\n[plugin @unichat/build-tools] "));
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
        },

        handleHotUpdate({ server }) {
            server.ws.send({ type: "full-reload" });

            return [];
        }
    };
}

const host = process.env.TAURI_DEV_HOST;

const plugins: PluginOption[] = [
    preact({
        babel: { plugins: [["babel-plugin-macros"], ["babel-plugin-transform-goober"]] },
        devToolsEnabled: false,
        devtoolsInProd: false,
        prefreshEnabled: false,
        reactAliasesEnabled: false
    }),
    minifyPlugin()
];

if (process.env.BUNDLE_ANALYZE === "true") {
    plugins.push(
        sonda({
            brotli: true,
            filename: path.resolve(__dirname, "coverage", "stats.html"),
            gzip: true,
            open: false
        }),
        uniChatBuildTools()
    );
}

export default defineConfig({
    root: path.resolve(__dirname),
    publicDir: path.resolve(__dirname, "public"),
    plugins: [...plugins],

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
        alias: {
            clsx: "clsx/lite",
            ...tsConfigPaths
        }
    }
});
