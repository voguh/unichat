/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
/* eslint-disable no-var */

declare global {
    var __TAURI__: typeof import("@tauri-apps/api");
    var __TAURI_PLUGIN_DIALOG__: typeof import("@tauri-apps/plugin-dialog");
    var __TAURI_PLUGIN_LOG__: typeof import("@tauri-apps/plugin-log");
    var __TAURI_PLUGIN_OPENER__: typeof import("@tauri-apps/plugin-opener");
    var __TAURI_PLUGIN_STORE__: typeof import("@tauri-apps/plugin-store");

    /* ====================================================================== */

    var __IS_DEV__: boolean;
    var __PLATFORM__: "linux" | "macos" | "windows"; // Actually represents `std::env::consts::OS` from Rust (https://doc.rust-lang.org/std/env/consts/constant.OS.html)

    var UNICHAT_DISPLAY_NAME: string;
    var UNICHAT_NAME: string;
    var UNICHAT_VERSION: string;
    var UNICHAT_DESCRIPTION: string;
    var UNICHAT_AUTHORS: string;
    var UNICHAT_HOMEPAGE: string;
    var UNICHAT_ICON: string;
    var UNICHAT_LICENSE_CODE: string;
    var UNICHAT_LICENSE_NAME: string;
    var UNICHAT_LICENSE_URL: string;

    var UNICHAT_GALLERY_DIR: string;
    var UNICHAT_LICENSE_FILE: string;
    var UNICHAT_PLUGINS_DIR: string;
    var UNICHAT_WIDGETS_DIR: string;
}

export {};
