/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![warn(clippy::implicit_return)]
#![allow(clippy::needless_return)]
#![allow(clippy::redundant_field_names)]

use std::fs;
use std::path::PathBuf;

use tauri::Manager;

use crate::utils::properties;
use crate::utils::properties::AppPaths;

include!(concat!(env!("CARGO_MANIFEST_DIR"), "/target/gen/metadata.rs"));

mod actix;
mod commands;
mod events;
mod shared_emotes;
mod twitch;
mod utils;
mod youtube;

pub static STATIC_APP_ICON: &[u8] = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/icons/icon.png"));
pub static THIRD_PARTY_LICENSES: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/target/gen/third_party_licenses.json"));

fn copy_folder(src: &PathBuf, dest: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    if !dest.exists() {
        fs::create_dir(dest)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let src_path = entry.path();
        let dest_path = dest.join(entry.file_name());

        if file_type.is_dir() {
            copy_folder(&src_path, &dest_path)?;
        } else if file_type.is_file() {
            fs::copy(&src_path, &dest_path)?;
        }
    }

    return Ok(());
}

fn setup(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    events::init(app)?;
    utils::properties::init(app)?;
    utils::settings::init(app)?;
    youtube::init(app)?;

    /* ========================================================================================== */

    let widgets_dir = properties::get_app_path(AppPaths::UniChatWidgets);
    if !&widgets_dir.exists() {
        fs::create_dir_all(&widgets_dir)?;
    }

    if fs::read_dir(&widgets_dir)?.next().is_none() {
        let widget_defaults_dir = properties::get_app_path(AppPaths::UniChatWidgetDefaults);
        copy_folder(&widget_defaults_dir, &widgets_dir)?;
        log::info!("Copied template widgets to: {}", widgets_dir.display());
    }

    let readme_path = widgets_dir.join("README.md");
    if !readme_path.exists() {
        let readme_notice = "This directory contains user-created widgets for UniChat. You can add your own widgets here.";
        fs::write(widgets_dir.join("README.md"), readme_notice)?;
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

#[tokio::main]
async fn main() {
    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let log_level = if utils::is_dev() {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Warn
    };

    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_log::Builder::new().level(log_level).build())
        .plugin(tauri_plugin_opener::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::is_dev,
            commands::store_get_item,
            commands::store_set_item,
            commands::toggle_webview,
            commands::list_widgets,
            youtube::get_youtube_scrapper_url,
            youtube::set_youtube_scrapper_url
        ])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| panic!("Failed to run {} v{}!\n{:?}", CARGO_PKG_DISPLAY_NAME, CARGO_PKG_VERSION, e));
}
