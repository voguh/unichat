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
use std::sync::atomic::AtomicBool;
use std::sync::atomic::Ordering;
use std::sync::OnceLock;
use std::thread;
use std::time::Instant;

use anyhow::Error;
use tauri::Listener;

use crate::utils::properties;
use crate::utils::properties::AppPaths;

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
mod wm;
mod youtube;

pub static UNICHAT_ICON_BYTES: &[u8] = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/icons/icon.png"));
pub static THIRD_PARTY_LICENSES: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/target/gen/third_party_licenses.json"));
static APP_HANDLE: OnceLock<tauri::AppHandle<tauri::Wry>> = OnceLock::new();
static STARTUP_STARTED: AtomicBool = AtomicBool::new(false);

pub fn get_app_handle() -> &'static tauri::AppHandle<tauri::Wry> {
    return APP_HANDLE.get().expect("APP_HANDLE is not initialized");
}

fn setup(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    APP_HANDLE.set(app.handle().clone()).map_err(|e| anyhow::anyhow!("Failed to set APP_HANDLE: {:#?}", e))?;

    /* ====================================================================== */

    let splash_screen = wm::splash_window::create()?;
    splash_screen.once(wm::splash_window::SPLASH_WINDOW_READY_EVENT, |_| start_startup());

    return Ok(());
}

fn start_startup() {
    if STARTUP_STARTED.swap(true, Ordering::SeqCst) {
        return;
    }

    // Runs off the event loop thread, otherwise the splash screen would freeze instead of showing
    // the progress it is being fed.
    thread::spawn(|| {
        if let Err(err) = run_startup() {
            log::error!("An error occurred on startup process: {:#?}", err);
            wm::error_window::open(&err);
        }

        wm::splash_window::close();
    });
}

fn run_startup() -> Result<(), Error> {
    let start = Instant::now();
    wm::splash_window::notice(0, &format!("Starting {} v{}...", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION));

    /* ========================================================================================== */

    wm::splash_window::stage(1, "Initializing properties...");
    utils::properties::init()?;

    wm::splash_window::stage(2, "Initializing settings...");
    utils::settings::init()?;

    /* ====================================================================== */

    wm::splash_window::stage(3, "Setting up application plugins directory...");
    let user_plugins_dir = properties::get_app_path(AppPaths::UniChatUserPlugins);
    if !&user_plugins_dir.exists() {
        log::info!("Creating user plugins directory at {:?}", &user_plugins_dir);
        fs::create_dir_all(&user_plugins_dir)?;
    }

    /* ====================================================================== */

    wm::splash_window::stage(4, "Setting up application gallery directory...");
    let gallery_dir = properties::get_app_path(AppPaths::UniChatGallery);
    if !&gallery_dir.exists() {
        log::info!("Creating gallery directory at {:?}", &gallery_dir);
        fs::create_dir_all(&gallery_dir)?;
    }

    /* ====================================================================== */

    wm::splash_window::stage(5, "Setting up application widgets directory...");
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !&user_widgets_dir.exists() {
        log::info!("Creating user widgets directory at {:?}", &user_widgets_dir);
        fs::create_dir_all(&user_widgets_dir)?;
    }

    /* ====================================================================== */

    wm::splash_window::stage(6, "Initializing events emitter module...");
    events::init()?;

    wm::splash_window::stage(7, "Initializing currency module...");
    currency::init()?;

    wm::splash_window::stage(8, "Fetching global shared emotes...");
    shared_emotes::fetch_global_shared_emotes()?;

    wm::splash_window::stage(9, "Initializing plugins module...");
    plugins::init()?;

    wm::splash_window::stage(10, "Initializing userstore module...");
    utils::userstore::init()?;

    wm::splash_window::stage(11, "Initializing widgets module...");
    widgets::init()?;

    /* ====================================================================== */

    wm::splash_window::stage(12, "Registering Twitch integration...");
    twitch::init()?;

    wm::splash_window::stage(13, "Registering YouTube integration...");
    youtube::init()?;

    wm::splash_window::stage(14, "Loading plugins...");
    plugins::load_plugins()?;

    /* ====================================================================== */

    wm::splash_window::stage(15, "Initializing HTTP server...");
    tauri::async_runtime::spawn(axum::start());

    /* ====================================================================== */

    let end = Instant::now();
    let duration = end.duration_since(start);
    wm::splash_window::notice(wm::splash_window::TOTAL_STAGES, &format!("Setup completed successfully in {:.2?}.", duration));

    /* ========================================================================================== */

    wm::main_window::create()?;

    return Ok(());
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

    tauri::Builder::default().setup(setup).on_window_event(wm::on_window_event)
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::default()
            .level(log_level)
            .clear_targets()
            .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepSome(7))
            .max_file_size(1e6 as u128) // 1 MB
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
