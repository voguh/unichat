/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(clippy::implicit_return)]
#![allow(clippy::needless_return)]
#![allow(clippy::redundant_field_names)]

use std::env;
use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;
use std::time::Instant;

use anyhow::Error;
use anyhow::anyhow;
use tauri::Emitter as _;
use tauri::Manager as _;
use tauri::WebviewWindowBuilder;
use tauri_plugin_dialog::DialogExt as _;
use tauri_plugin_dialog::MessageDialogButtons;
use tauri_plugin_dialog::MessageDialogKind;

use crate::utils::base64;
use crate::utils::path_to_string;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::userstore::flush_userstore;

include!(concat!(env!("CARGO_MANIFEST_DIR"), "/target/gen/metadata.rs"));

mod axum;
mod commands;
mod currency;
mod events;
mod plugins;
mod scraper;
mod shared_emotes;
mod twitch;
mod utils;
mod widgets;
mod youtube;

pub static UNICHAT_ICON_BYTES: &[u8] = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/icons/icon.png"));
pub static THIRD_PARTY_LICENSES: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/target/gen/third_party_licenses.json"));
static APP_HANDLE: OnceLock<tauri::AppHandle<tauri::Wry>> = OnceLock::new();

// All webviews share the same default WebView2 environment (one per user data folder), and its
// AdditionalBrowserArguments are locked in by whichever webview is created first - which is
// "splash-screen", built from `tauri.conf.json`. So this value must stay identical to that
// window's `additionalBrowserArgs` entry and be applied to every other `WebviewWindowBuilder` in
// the app, or later webview creations fail with WebView2 error 0x8007139F. Also note
// `additional_browser_args` fully replaces wry's default Windows arguments, so they are repeated
// here - see warning at:
// https://docs.rs/tauri/2.11.2/tauri/webview/struct.WebviewWindowBuilder.html#method.additional_browser_args
pub const WEBVIEW2_ADDITIONAL_BROWSER_ARGS: &str = "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --lang=en-US";

pub fn get_app_handle() -> &'static tauri::AppHandle<tauri::Wry> {
    return APP_HANDLE.get().expect("APP_HANDLE is not initialized");
}

fn log_startup_process<S: Into<String>>(window: &tauri::WebviewWindow, message: S) {
    let message = message.into();
    log::info!("{}", &message);
    let _ = window.emit("unichat://splashscreen:update", message);
}

fn setup_inner() -> Result<(), Error> {
    let app_handle = get_app_handle();
    let splash_screen = app_handle.get_webview_window("splash-screen").ok_or(anyhow!("Splash Screen window not found"))?;
    let start = Instant::now();

    log_startup_process(&splash_screen, format!("Starting {} v{}...", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION));

    log_startup_process(&splash_screen, "[01/15] Initializing properties...");
    utils::properties::init()?;
    log_startup_process(&splash_screen, "[02/15] Initializing settings...");
    utils::settings::init()?;

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[03/15] Setting up application plugins directory...");
    let user_plugins_dir = properties::get_app_path(AppPaths::UniChatUserPlugins);
    if !&user_plugins_dir.exists() {
        log::info!("Creating user plugins directory at {:?}", &user_plugins_dir);
        fs::create_dir_all(&user_plugins_dir)?;
    }

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[04/15] Setting up application gallery directory...");
    let gallery_dir = properties::get_app_path(AppPaths::UniChatGallery);
    if !&gallery_dir.exists() {
        log::info!("Creating gallery directory at {:?}", &gallery_dir);
        fs::create_dir_all(&gallery_dir)?;
    }

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[05/15] Setting up application widgets directory...");
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !&user_widgets_dir.exists() {
        log::info!("Creating user widgets directory at {:?}", &user_widgets_dir);
        fs::create_dir_all(&user_widgets_dir)?;
    }

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[06/15] Initializing events emitter module...");
    events::init()?;

    log_startup_process(&splash_screen, "[07/15] Initializing currency module...");
    currency::init()?;

    log_startup_process(&splash_screen, "[08/15] Fetching global shared emotes...");
    shared_emotes::fetch_global_shared_emotes()?;

    log_startup_process(&splash_screen, "[09/15] Initializing plugins module...");
    plugins::init()?;

    log_startup_process(&splash_screen, "[10/15] Initializing userstore module...");
    utils::userstore::init()?;

    log_startup_process(&splash_screen, "[11/15] Initializing widgets module...");
    widgets::init()?;

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[12/15] Registering Twitch integration...");
    twitch::init()?;
    log_startup_process(&splash_screen, "[13/15] Registering YouTube integration...");
    youtube::init()?;

    log_startup_process(&splash_screen, "[14/15] Loading plugins...");
    plugins::load_plugins()?;

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[15/15] Initializing HTTP server...");
    tauri::async_runtime::spawn(axum::start());

    /* ========================================================================================== */

    let end = Instant::now();
    let duration = end.duration_since(start);
    log_startup_process(&splash_screen, format!("Setup completed successfully in {:.2?}.", duration));

    /* ========================================================================================== */

    return Ok(());
}

fn setup(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    APP_HANDLE.set(app.handle().clone()).map_err(|e| anyhow::anyhow!("Failed to set APP_HANDLE: {:#?}", e))?;

    std::thread::spawn(|| {
        let app = get_app_handle();

        if let Err(e) = setup_inner() {
            log::error!("Error during setup: {:?}", e);
            app.dialog()
                .message(format!("An error occurred on startup process.\n\n{:?}", e))
                .title("Error on startup")
                .kind(MessageDialogKind::Error)
                .buttons(MessageDialogButtons::Ok)
                .show(|_| {
                    let app_handle = get_app_handle();
                    app_handle.exit(1);
                });
        } else {
            let is_dev = utils::is_dev();
            let platform = std::env::consts::OS;

            let unichat_icon = format!("data:image/png;base64,{}", base64::encode(UNICHAT_ICON_BYTES));

            let gallery_dir = path_to_string(&properties::get_app_path(AppPaths::UniChatGallery));
            let license_file = path_to_string(&properties::get_app_path(AppPaths::UniChatLicense));
            let plugins_dir = path_to_string(&properties::get_app_path(AppPaths::UniChatUserPlugins));
            let widgets_dir = path_to_string(&properties::get_app_path(AppPaths::UniChatUserWidgets));

            let main_url = tauri::WebviewUrl::App("index.html".into());
            let window_builder = WebviewWindowBuilder::new(app, "main", main_url)
                .title(format!("{} v{}", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION))
                .inner_size(1024.0, 576.0)
                .maximizable(false)
                .resizable(false)
                .center()
                .additional_browser_args(WEBVIEW2_ADDITIONAL_BROWSER_ARGS)
                .initialization_script(format!(r#"
                    globalThis.__IS_DEV__ = {is_dev};
                    globalThis.__PLATFORM__ = "{platform}";

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
                "#));

            if let Ok(_) = window_builder.build() {
                log::info!("Main window created successfully.");

                if let Some(splash_screen) = app.get_webview_window("splash-screen") {
                    let _ = splash_screen.close();
                }
            } else {
                log::error!("Failed to create main window.");
            }
        }
    });

    return Ok(());
}

fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    let app = window.app_handle();

    if let tauri::WindowEvent::Destroyed = event {
        log::info!("Window '{}' destroyed.", window.label());
    }

    if window.label() == "main" || (window.label() == "splash-screen" && app.get_webview_window("main").is_none()) {
        if let tauri::WindowEvent::Destroyed = event {
            if let Err(err) = flush_userstore() {
                log::error!("Failed to flush userstore to disk: {:#?}", err);
            }

            for (key, window) in app.webview_windows() {
                if key != "main" {
                    if let Err(err) = window.destroy() {
                        log::error!("Failed to destroy window '{}': {:#?}", key, err);
                    }
                }
            }
        }
    } else if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        if window.label().ends_with("-chat") {
            api.prevent_close();

            if let Err(err) = window.hide() {
                log::error!("Failed to hide chat window '{}': {:#?}", window.label(), err);
            }
        }
    }
}

fn main() {
    let log_level: log::LevelFilter;
    if let Ok(log_level_raw) = env::var("UNICHAT_LOG_LEVEL") {
        log_level = match log_level_raw.to_lowercase().as_str() {
            "error" => log::LevelFilter::Error,
            "warn" | "warning" => log::LevelFilter::Warn,
            "info" => log::LevelFilter::Info,
            "debug" => log::LevelFilter::Debug,
            "trace" => log::LevelFilter::Trace,
            _ => log::LevelFilter::Info
        };
    } else if utils::is_dev() {
        log_level = log::LevelFilter::Debug;
    } else {
        log_level = log::LevelFilter::Info;
    }

    tauri::Builder::default().setup(setup).on_window_event(on_window_event)
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::default()
            .level(log_level)
            .clear_targets()
            .target(tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout))
            .target(tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir { file_name: Some(UNICHAT_NAME.to_string()) }))
            .build()
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::dispatch_clear_chat,
            commands::get_releases,
            commands::get_system_hosts,
            commands::get_third_party_licenses,
            commands::currency::get_currencies,
            commands::emulator::dispatch_emulated_event,
            commands::gallery::get_gallery_items,
            commands::gallery::upload_gallery_items,
            commands::plugins::get_plugins,
            commands::store::settings_get_item,
            commands::store::settings_get_items,
            commands::store::settings_set_item,
            commands::store::settings_set_items,
            commands::tour::get_prev_tour_steps,
            commands::tour::get_tour_steps,
            commands::tour::set_tour_steps,
            commands::tour::tour_steps_has_new,
            commands::scrapers::get_scrapers,
            commands::scrapers::get_scraper,
            commands::scrapers::validate_scraper_url,
            commands::scrapers::get_scraper_stored_url,
            commands::scrapers::get_scraper_webview_url,
            commands::scrapers::set_scraper_webview_url,
            commands::scrapers::toggle_scraper_webview,
            commands::userstore::get_userstore,
            commands::userstore::set_userstore,
            commands::widgets::get_widget_fields,
            commands::widgets::get_widget_fieldstate,
            commands::widgets::get_widgets,
            commands::widgets::set_widget_fieldstate,
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| panic!("Failed to run {} v{}!\n{:?}", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION, e));
}
