/// <reference types="vite/client" />
/// <reference types="vitest/config" />
import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

function fullReload(): PluginOption {
    return {
        name: "@vitejs/plugin-full-reload",
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
    plugins: [react({ plugins: [["@swc/plugin-styled-components", {}]] }), fullReload()],

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

    resolve: {
        alias: {
            // Fix slowdown with @tabler/icons-react
            // See: https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
            "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
            unichat: path.resolve(__dirname, "src")
        }
    },

    test: {
        globals: true,
        setupFiles: path.resolve(__dirname, "__tests__", "setupTests.ts"),
        environment: "jsdom"
    }
});
