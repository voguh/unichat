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
use tauri::WebviewWindowBuilder;
use url::Url;

// All webviews share the same default WebView2 environment (one per user data folder), and its
// AdditionalBrowserArguments are locked in by whichever webview is created first.
//
// So this value must stay identical to that window's `additionalBrowserArgs` entry and be applied
// to every other `WebviewWindowBuilder` in the app, or later webview creations fail with WebView2
// error 0x8007139F.
//
// Also note `additional_browser_args` fully replaces wry's default value, see warning at:
// https://docs.rs/tauri/2.11.5/tauri/webview/struct.WebviewWindowBuilder.html#method.additional_browser_args
const WEBVIEW2_ADDITIONAL_BROWSER_ARGS: &str = "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --lang=en-US";

pub fn new(label: &str, url: &str) -> WebviewWindowBuilder<'static, tauri::Wry, AppHandle> {
    let app_handle = crate::get_app_handle();

    let webview_url;
    if url.starts_with("https://") {
        let external_url = Url::parse(url).expect("Failed to parse external URL");
        webview_url = WebviewUrl::External(external_url);
    } else {
        webview_url = WebviewUrl::App(PathBuf::from(url));
    }

    let window_builder = WebviewWindowBuilder::new(app_handle, label, webview_url)
        .additional_browser_args(WEBVIEW2_ADDITIONAL_BROWSER_ARGS);

    return window_builder;
}
