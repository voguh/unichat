/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::path::PathBuf;

use tauri::AppHandle;
use tauri::WebviewUrl;
use tauri::WebviewWindow;
use tauri::WebviewWindowBuilder;
use tauri::webview::PageLoadEvent;
use tauri::webview::PageLoadPayload;
use url::Url;

use crate::UNICHAT_AUTHORS;
use crate::UNICHAT_DESCRIPTION;
use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_HOMEPAGE;
use crate::UNICHAT_ICON_BYTES;
use crate::UNICHAT_LICENSE_CODE;
use crate::UNICHAT_LICENSE_NAME;
use crate::UNICHAT_LICENSE_URL;
use crate::UNICHAT_NAME;
use crate::UNICHAT_VERSION;
use crate::plugins;
use crate::utils::base64;
use crate::utils::is_dev;
use crate::utils::path_to_string;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

/* ========================================================================== */

// All webviews share the same default WebView2 environment (one per user data folder), and its
// AdditionalBrowserArguments are locked in by whichever webview is created first.
//
// So this value must stay identical to that window's `additionalBrowserArgs` entry and be applied
// to every other `WebviewWindowBuilder` in the app, or later webview creations fail with WebView2
// error 0x8007139F.
//
// Also note `additional_browser_args` fully replaces wry's default value, see warning at:
// https://docs.rs/tauri/2.11.5/tauri/webview/struct.WebviewWindowBuilder.html#method.additional_browser_args
const ADDITIONAL_BROWSER_ARGS: &str = "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --lang=en-US";

pub fn new(label: &str, url: &str) -> WebviewWindowBuilder<'static, tauri::Wry, AppHandle> {
    let app_handle = crate::get_app_handle();

    let webview_url;
    if url.starts_with("https://") {
        let external_url = Url::parse(url).expect("Failed to parse external URL");
        webview_url = WebviewUrl::External(external_url);
    } else {
        webview_url = WebviewUrl::App(PathBuf::from(url));
    }

    return WebviewWindowBuilder::new(app_handle, label, webview_url).additional_browser_args(ADDITIONAL_BROWSER_ARGS);
}

pub fn webapp_globals_script() -> String {
    let is_dev = is_dev();
    let platform = std::env::consts::OS;
    let plugins_enabled = plugins::runtime_initialized();

    let unichat_icon = format!("data:image/png;base64,{}", base64::encode(UNICHAT_ICON_BYTES));

    let gallery_dir = path_to_string(&properties::get_app_path(AppPaths::UniChatGallery));
    let license_file = path_to_string(&properties::get_app_path(AppPaths::UniChatLicense));
    let plugins_dir = path_to_string(&properties::get_app_path(AppPaths::UniChatUserPlugins));
    let widgets_dir = path_to_string(&properties::get_app_path(AppPaths::UniChatUserWidgets));

    return format!(
        r#"
            globalThis.__IS_DEV__ = {is_dev};
            globalThis.__PLATFORM__ = "{platform}";
            globalThis.__PLUGINS_ENABLED__ = {plugins_enabled};

            globalThis.UNICHAT_DISPLAY_NAME = "{UNICHAT_DISPLAY_NAME}";
            globalThis.UNICHAT_NAME = "{UNICHAT_NAME}";
            globalThis.UNICHAT_VERSION = "{UNICHAT_VERSION}";
            globalThis.UNICHAT_DESCRIPTION = "{UNICHAT_DESCRIPTION}";
            globalThis.UNICHAT_AUTHORS = "{UNICHAT_AUTHORS}";
            globalThis.UNICHAT_HOMEPAGE = "{UNICHAT_HOMEPAGE}";
            globalThis.UNICHAT_ICON = "{unichat_icon}";
            globalThis.UNICHAT_LICENSE_CODE = "{UNICHAT_LICENSE_CODE}";
            globalThis.UNICHAT_LICENSE_NAME = "{UNICHAT_LICENSE_NAME}";
            globalThis.UNICHAT_LICENSE_URL = "{UNICHAT_LICENSE_URL}";

            globalThis.UNICHAT_GALLERY_DIR = "{gallery_dir}";
            globalThis.UNICHAT_LICENSE_FILE = "{license_file}";
            globalThis.UNICHAT_PLUGINS_DIR = "{plugins_dir}";
            globalThis.UNICHAT_WIDGETS_DIR = "{widgets_dir}";
        "#
    );
}

pub fn show_on_page_finished(window: &WebviewWindow<tauri::Wry>, payload: &PageLoadPayload<'_>) -> bool {
    if payload.event() != PageLoadEvent::Finished {
        return false;
    }

    if let Err(err) = window.show() {
        log::error!("Failed to show window '{}': {:#?}", window.label(), err);
        return false;
    }

    return true;
}
