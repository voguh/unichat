/// <reference types="vite/client" />
/// <reference types="vitest/config" />

import fs from "node:fs";
import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import MagicString from "magic-string";
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

const SOURCE_DIR = path.resolve(__dirname, "src");
const DIST_DIR = path.resolve(__dirname, "dist");
function uniChatBuildTools(): Plugin {
    return {
        name: "@unichat/build-tools",
        buildStart() {
            if (fs.existsSync(DIST_DIR)) {
                fs.rmSync(DIST_DIR, { recursive: true, force: true });
            }
        },
        transform(code, id) {
            if (id.includes("node_modules") || !id.match(/\.(ts|tsx|js|jsx)$/)) {
                return null;
            }

            const replaces: [number, number, string][] = [];
            const ms = new MagicString(code);
            const filename = id.replaceAll(path.sep, "/").replace(`${SOURCE_DIR}/`, "");
            const dirname = path.dirname(filename);

            const regEx = /\b(__LINE__|__COLUMN__|__FILE__|__DIR__|__dirname|__filename)\b/g;

            let match: RegExpExecArray | null;
            while ((match = regEx.exec(code))) {
                const start = match.index;
                const end = start + match[0].length;

                switch (match[0]) {
                    case "__LINE__": {
                        const line = code.slice(0, start).split("\n").length;
                        replaces.push([start, end, String(line)]);
                        break;
                    }
                    case "__COLUMN__": {
                        const lineStart = code.lastIndexOf("\n", start - 1) + 1;
                        const column = start - lineStart + 1;
                        replaces.push([start, end, String(column)]);
                        break;
                    }

                    case "__FILE__":
                    case "__filename": {
                        replaces.push([start, end, JSON.stringify(filename)]);
                        break;
                    }

                    case "__DIR__":
                    case "__dirname": {
                        replaces.push([start, end, JSON.stringify(dirname)]);
                        break;
                    }
                }
            }

            /* ================================================================================== */

            const loggerRegEx = /\b(logger\$trace|logger\$debug|logger\$info|logger\$warn|logger\$error)\b/g;

            let loggerMatch: RegExpExecArray | null;
            while ((loggerMatch = loggerRegEx.exec(code))) {
                const start = loggerMatch.index;
                const end = start + loggerMatch[0].length;

                const line = code.slice(0, start).split("\n").length;

                switch (loggerMatch[0]) {
                    case "logger$trace": {
                        replaces.push([start, end, `logger$withLogger("${filename}", ${line}).trace`]);
                        break;
                    }
                    case "logger$debug": {
                        replaces.push([start, end, `logger$withLogger("${filename}", ${line}).debug`]);
                        break;
                    }
                    case "logger$info": {
                        replaces.push([start, end, `logger$withLogger("${filename}", ${line}).info`]);
                        break;
                    }
                    case "logger$warn": {
                        replaces.push([start, end, `logger$withLogger("${filename}", ${line}).warn`]);
                        break;
                    }
                    case "logger$error": {
                        replaces.push([start, end, `logger$withLogger("${filename}", ${line}).error`]);
                        break;
                    }
                }
            }

            /* ================================================================================== */

            replaces.sort(([startA], [startB]) => startB - startA);
            for (const [start, end, replacement] of replaces) {
                ms.overwrite(start, end, replacement);
            }

            return {
                code: ms.toString(),
                // map: ms.generateMap({ source: filename, includeContent: true })
                map: null
            };
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

    build: {
        rollupOptions: {
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
                        if (id.includes("mantine")) {
                            return "mantine-vendor";
                        } else if (id.includes("react")) {
                            return "react-vendor";
                        } else if (id.includes("node_modules")) {
                            return "general-vendor";
                        }
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
        environment: "jsdom"
    }
});
