/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(clippy::implicit_return)]
#![allow(clippy::needless_return)]
#![allow(clippy::redundant_field_names)]

use std::env;
use std::fs;
use std::io::Write;
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
    twitch::init(app)?;
    utils::properties::init(app)?;
    utils::render_emitter::init(app)?;
    utils::settings::init(app)?;
    youtube::init(app)?;

    /* ========================================================================================== */

    let system_widgets_dir = properties::get_app_path(AppPaths::UniChatSystemWidget);
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !&user_widgets_dir.exists() {
        fs::create_dir_all(&user_widgets_dir)?;
    }

    let example_widget_path_source = system_widgets_dir.join("default");
    let example_widget_path_dest = user_widgets_dir.join("example");
    if !example_widget_path_dest.exists() {
        copy_folder(&example_widget_path_source, &example_widget_path_dest)?;
    }

    let unichat_d_ts_path_source = system_widgets_dir.join("unichat.d.ts");
    let unichat_d_ts_path_dest = user_widgets_dir.join("unichat.d.ts");
    if !unichat_d_ts_path_dest.exists() {
        fs::copy(unichat_d_ts_path_source, unichat_d_ts_path_dest)?;
    }

    let jsconfig_json_path_source = system_widgets_dir.join("jsconfig.json");
    let jsconfig_json_path_dest = user_widgets_dir.join("jsconfig.json");
    if !jsconfig_json_path_dest.exists() {
        fs::copy(jsconfig_json_path_source, jsconfig_json_path_dest)?;
    }

    let readme_path = user_widgets_dir.join("README.md");
    if !readme_path.exists() {
        let mut readme_file = fs::OpenOptions::new().create(true).append(true).open(readme_path)?;
        let readme_notice = r#"
            This directory contains user-created widgets for UniChat. You can add your own widgets here.

            Node: folders starting with a dot (.) are hidden by default in the widget selector.
        "#;

        let formatted_readme_notice = readme_notice.lines().skip(1)
            .map(|l| l.trim()).collect::<Vec<&str>>().join("\n");
        writeln!(readme_file, "{formatted_readme_notice}")?;
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
    } else if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        window.hide().unwrap();
    }
}

fn main() {
    let log_level: log::LevelFilter;
    if utils::is_dev() || env::var("UNICHAT_DEBUG").is_ok() {
        log_level = log::LevelFilter::Debug;
    } else if let Ok(log_level_raw) = env::var("UNICHAT_LOG_LEVEL") {
        log_level = match log_level_raw.to_lowercase().as_str() {
            "error" => log::LevelFilter::Error,
            "warn" | "warning" => log::LevelFilter::Warn,
            "info" => log::LevelFilter::Info,
            "debug" => log::LevelFilter::Debug,
            "trace" => log::LevelFilter::Trace,
            _ => log::LevelFilter::Info
        };
    } else {
        log_level = log::LevelFilter::Info;
    }

    let _ = rustls::crypto::aws_lc_rs::default_provider().install_default()
        .expect("Failed to install `aws-lc-rs` as the default TLS provider");

    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_log::Builder::default()
            .level(log_level)
            .clear_targets()
            .target(tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout))
            .target(tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir { file_name: Some(CARGO_PKG_NAME.to_string()) }))
            .build()
        )
        .plugin(tauri_plugin_opener::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::get_prev_tour_steps,
            commands::get_tour_steps,
            commands::set_tour_steps,
            commands::is_dev,
            commands::store_get_item,
            commands::store_set_item,
            commands::toggle_webview,
            commands::dispatch_clear_chat,
            commands::list_widgets,
            twitch::get_twitch_scrapper_url,
            twitch::set_twitch_scrapper_url,
            youtube::get_youtube_scrapper_url,
            youtube::set_youtube_scrapper_url
        ])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| panic!("Failed to run {} v{}!\n{:?}", CARGO_PKG_DISPLAY_NAME, CARGO_PKG_VERSION, e));
}
