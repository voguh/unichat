declare global {
    const __TAURI__: typeof import("@tauri-apps/api");
    const __TAURI_PLUGIN_DIALOG__: typeof import("@tauri-apps/plugin-dialog");
    const __TAURI_PLUGIN_LOG__: typeof import("@tauri-apps/plugin-log");
    const __TAURI_PLUGIN_OPENER__: typeof import("@tauri-apps/plugin-opener");
    const __TAURI_PLUGIN_STORE__: typeof import("@tauri-apps/plugin-store");

    interface Window {
        __TAURI__: typeof import("@tauri-apps/api");
        __TAURI_PLUGIN_DIALOG__: typeof import("@tauri-apps/plugin-dialog");
        __TAURI_PLUGIN_LOG__: typeof import("@tauri-apps/plugin-log");
        __TAURI_PLUGIN_OPENER__: typeof import("@tauri-apps/plugin-opener");
        __TAURI_PLUGIN_STORE__: typeof import("@tauri-apps/plugin-store");
    }
}

export {};
