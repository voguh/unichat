/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

declare global {
    const __TAURI__: typeof import("@tauri-apps/api");
    const __TAURI_PLUGIN_DIALOG__: typeof import("@tauri-apps/plugin-dialog");
    const __TAURI_PLUGIN_LOG__: typeof import("@tauri-apps/plugin-log");
    const __TAURI_PLUGIN_OPENER__: typeof import("@tauri-apps/plugin-opener");
    const __TAURI_PLUGIN_STORE__: typeof import("@tauri-apps/plugin-store");

    /** Path of the current file from the source root (literal string in source code) */
    const __FILE__: string;
    /** Path of the current file directory from the source root (literal string in source code) */
    const __DIR__: string;
    /** Line number of the current line (literal number in source code) */
    const __LINE__: number;
    /** Column number of the current line (literal number in source code) */
    const __COLUMN__: number;

    /** Path of the current file from the source root (literal string in source code) */
    const __filename: string;
    /** Path of the current file directory from the source root (literal string in source code) */
    const __dirname: string;

    interface Window {
        __TAURI__: typeof import("@tauri-apps/api");
        __TAURI_PLUGIN_DIALOG__: typeof import("@tauri-apps/plugin-dialog");
        __TAURI_PLUGIN_LOG__: typeof import("@tauri-apps/plugin-log");
        __TAURI_PLUGIN_OPENER__: typeof import("@tauri-apps/plugin-opener");
        __TAURI_PLUGIN_STORE__: typeof import("@tauri-apps/plugin-store");
    }
}

export {};
