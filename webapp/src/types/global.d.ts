/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
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
    const __TAURI_PLUGIN_OS__: typeof import("@tauri-apps/plugin-os");
    const __TAURI_PLUGIN_STORE__: typeof import("@tauri-apps/plugin-store");

    /* ====================================================================== */

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

    const UNICHAT_THIRD_PARTY_LICENSES: import("unichat/types").ThirdPartyLicenseInfo[];
    const UNICHAT_RELEASES: import("unichat/types").ReleaseInfo[];

    /* ====================================================================== */

    interface Window {
        __TAURI__: typeof import("@tauri-apps/api");
        __TAURI_PLUGIN_DIALOG__: typeof import("@tauri-apps/plugin-dialog");
        __TAURI_PLUGIN_LOG__: typeof import("@tauri-apps/plugin-log");
        __TAURI_PLUGIN_OPENER__: typeof import("@tauri-apps/plugin-opener");
        __TAURI_PLUGIN_OS__: typeof import("@tauri-apps/plugin-os");
        __TAURI_PLUGIN_STORE__: typeof import("@tauri-apps/plugin-store");

        /* ================================================================== */

        /** Path of the current file from the source root (literal string in source code) */
        __FILE__: string;
        /** Path of the current file directory from the source root (literal string in source code) */
        __DIR__: string;
        /** Line number of the current line (literal number in source code) */
        __LINE__: number;
        /** Column number of the current line (literal number in source code) */
        __COLUMN__: number;

        /** Path of the current file from the source root (literal string in source code) */
        __filename: string;
        /** Path of the current file directory from the source root (literal string in source code) */
        __dirname: string;

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

        UNICHAT_THIRD_PARTY_LICENSES: import("unichat/types").ThirdPartyLicenseInfo[];
        UNICHAT_RELEASES: import("unichat/types").ReleaseInfo[];
    }
}

export {};
