// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![warn(clippy::implicit_return)]
#![allow(clippy::needless_return)]

use std::fs;

use tauri::Manager;

use crate::utils::properties;
use crate::utils::properties::AppPaths;

mod actix;
mod commands;
mod events;
mod utils;
mod youtube;

fn setup(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    events::init(app)?;
    utils::properties::init(app)?;
    utils::settings::init(app)?;
    youtube::init(app)?;

    /* ========================================================================================== */

    let widgets_dir = properties::get_app_path(AppPaths::UniChatWidgetsDir);
    if !&widgets_dir.exists() {
        fs::create_dir_all(&widgets_dir)?;
    }

    /* ========================================================================================== */

    let http_server = actix::new(app);
    app.manage(actix::ActixState{ handle: http_server });

    return Ok(());
}

fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    let app = window.app_handle();

    if window.label() == "main" {
        if let tauri::WindowEvent::Destroyed = event {
            let actix = app.state::<actix::ActixState>();
            actix.handle.abort();

            for (key, window) in app.webview_windows() {
                if key != "main" {
                    window.destroy().unwrap();
                }
            }

        }
    } else {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            window.hide().unwrap();
        }
    }
}

fn main() {
    let log_level = if utils::is_dev() {
        log::LevelFilter::Trace
    } else {
        log::LevelFilter::Warn
    };

    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_log::Builder::new().level(log_level).build())
        .invoke_handler(tauri::generate_handler![
            commands::store_get_item,
            commands::store_set_item,
            commands::settings_list_all,
            commands::settings_get_item,
            commands::settings_set_item,
            commands::toggle_webview,
            commands::update_webview_url,
            commands::list_widgets,
            commands::open_widgets_dir
        ])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .expect("Error while running UniChat application");
}
