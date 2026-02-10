/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

declare global {
    const __TAURI__: typeof import("@tauri-apps/api");
    const __TAURI_PLUGIN_DIALOG__: typeof import("@tauri-apps/plugin-dialog");
    const __TAURI_PLUGIN_LOG__: typeof import("@tauri-apps/plugin-log");
    const __TAURI_PLUGIN_OPENER__: typeof import("@tauri-apps/plugin-opener");
    const __TAURI_PLUGIN_OS__: typeof import("@tauri-apps/plugin-os");
    const __TAURI_PLUGIN_STORE__: typeof import("@tauri-apps/plugin-store");

    /* ====================================================================== */

    const __IS_DEV__: boolean;
    const UNICHAT_DISPLAY_NAME: string;
    const UNICHAT_NAME: string;
    const UNICHAT_VERSION: string;
    const UNICHAT_DESCRIPTION: string;
    const UNICHAT_AUTHORS: string;
    const UNICHAT_HOMEPAGE: string;
    const UNICHAT_ICON: string;
    const UNICHAT_LICENSE_CODE: string;
    const UNICHAT_LICENSE_NAME: string;
    const UNICHAT_LICENSE_URL: string;

    const UNICHAT_GALLERY_DIR: string;
    const UNICHAT_LICENSE_FILE: string;
    const UNICHAT_PLUGINS_DIR: string;
    const UNICHAT_WIDGETS_DIR: string;

    /* ====================================================================== */

    interface Window {
        __TAURI__: typeof import("@tauri-apps/api");
        __TAURI_PLUGIN_DIALOG__: typeof import("@tauri-apps/plugin-dialog");
        __TAURI_PLUGIN_LOG__: typeof import("@tauri-apps/plugin-log");
        __TAURI_PLUGIN_OPENER__: typeof import("@tauri-apps/plugin-opener");
        __TAURI_PLUGIN_OS__: typeof import("@tauri-apps/plugin-os");
        __TAURI_PLUGIN_STORE__: typeof import("@tauri-apps/plugin-store");

        /* ================================================================== */

        __IS_DEV__: boolean;
        UNICHAT_DISPLAY_NAME: string;
        UNICHAT_NAME: string;
        UNICHAT_VERSION: string;
        UNICHAT_DESCRIPTION: string;
        UNICHAT_AUTHORS: string;
        UNICHAT_HOMEPAGE: string;
        UNICHAT_APP_ICON: string;
        UNICHAT_LICENSE_CODE: string;
        UNICHAT_LICENSE_NAME: string;
        UNICHAT_LICENSE_URL: string;

        UNICHAT_GALLERY_DIR: string;
        UNICHAT_LICENSE_FILE: string;
        UNICHAT_PLUGINS_DIR: string;
        UNICHAT_WIDGETS_DIR: string;
    }
}

export {};
