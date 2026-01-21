/// <reference types="vite/client" />
/// <reference types="vitest/config" />
import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import MagicString from "magic-string";
import { defineConfig, Plugin } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

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
function uniChatBuildTools(): Plugin {
    return {
        name: "@unichat/build-tools",
        transform(code, id) {
            if (id.includes("node_modules") || !id.match(/\.(ts|tsx|js|jsx)$/)) {
                return null;
            }

            const s = new MagicString(code);
            const filename = id.replaceAll(path.sep, "/").replace(`${SOURCE_DIR}/`, "");
            const dirname = path.dirname(filename);

            const regex = /\b(__dirname|__filename)\b/g;

            let match: RegExpExecArray | null;
            while ((match = regex.exec(code))) {
                const start = match.index;
                const end = start + match[0].length;

                switch (match[0]) {
                    case "__filename":
                        s.overwrite(start, end, JSON.stringify(filename));
                        break;

                    case "__dirname":
                        s.overwrite(start, end, JSON.stringify(dirname));
                        break;
                }
            }

            return {
                code: s.toString(),
                map: s.generateMap({ source: filename, includeContent: true })
            };
        }
    };
}

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
    root: path.resolve(__dirname),
    publicDir: path.resolve(__dirname, "public"),
    plugins: [
        fullReload(),
        uniChatBuildTools(),
        react({ plugins: [["@swc/plugin-styled-components", {}]] }),
        viteStaticCopy({
            targets: [
                {
                    src: path.resolve(__dirname, "node_modules", "source-map", "lib", "mappings.wasm"),
                    dest: "source-map"
                },
                {
                    src: path.resolve(__dirname, "node_modules", "source-map", "LICENSE"),
                    dest: "source-map"
                }
            ]
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

    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: "js/[name]-[hash].js",
                chunkFileNames: "js/[name]-[hash].js",

                sourcemap: true,
                plugins: [
                    {
                        name: "sourcemap-path-adjuster",
                        generateBundle(_options, bundle) {
                            for (const [fileName, file] of Object.entries(bundle)) {
                                if (fileName.includes("vendor")) {
                                    if (file.type === "chunk" && file.map) {
                                        file.map = null;
                                    }
                                }
                            }
                        }
                    }
                ],

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
