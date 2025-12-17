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

use crate::error::Error;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

include!(concat!(env!("CARGO_MANIFEST_DIR"), "/target/gen/metadata.rs"));

mod actix;
mod commands;
mod error;
mod events;
mod irc;
mod plugins;
mod scrapper;
mod shared_emotes;
mod twitch;
mod utils;
mod youtube;

pub static STATIC_APP_ICON: &[u8] = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/icons/icon.png"));
pub static THIRD_PARTY_LICENSES: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/target/gen/third_party_licenses.json"));

fn copy_folder(src: &PathBuf, dest: &PathBuf) -> Result<(), Error> {
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

fn copy_wrapper(src: &PathBuf, dest: &PathBuf) -> Result<(), Error> {
    if dest.exists() {
        if dest.is_dir() {
            fs::remove_dir_all(dest)?;
        } else {
            fs::remove_file(dest)?;
        }
    }

    if src.is_dir() {
        copy_folder(src, dest)?;
    } else {
        fs::copy(src, dest)?;
    }

    return Ok(());
}

fn setup(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    events::init(app)?;
    utils::properties::init(app)?;
    utils::settings::init(app)?;
    utils::render_emitter::init(app)?;

    /* ========================================================================================== */

    let user_plugins_dir = properties::get_app_path(AppPaths::UniChatUserPlugins);
    if !&user_plugins_dir.exists() {
        fs::create_dir_all(&user_plugins_dir)?;
    }

    plugins::init(app)?;

    /* ========================================================================================== */

    let gallery_dir = properties::get_app_path(AppPaths::UniChatGallery);
    if !&gallery_dir.exists() {
        fs::create_dir_all(&gallery_dir)?;
    }

    /* ========================================================================================== */

    let system_widgets_dir = properties::get_app_path(AppPaths::UniChatSystemWidgets);
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !&user_widgets_dir.exists() {
        fs::create_dir_all(&user_widgets_dir)?;
    }

    let example_widget_path_source = system_widgets_dir.join("default");
    let example_widget_path_dest = user_widgets_dir.join("example");
    copy_wrapper(&example_widget_path_source, &example_widget_path_dest)?;

    let unichat_d_ts_path_source = system_widgets_dir.join("unichat.d.ts");
    let unichat_d_ts_path_dest = user_widgets_dir.join("unichat.d.ts");
    copy_wrapper(&unichat_d_ts_path_source, &unichat_d_ts_path_dest)?;

    let jsconfig_json_path_source = system_widgets_dir.join("jsconfig.json");
    let jsconfig_json_path_dest = user_widgets_dir.join("jsconfig.json");
    copy_wrapper(&jsconfig_json_path_source, &jsconfig_json_path_dest)?;

    let readme_path = user_widgets_dir.join("README.md");
    if readme_path.exists() {
        if readme_path.is_dir() {
            fs::remove_dir_all(&readme_path)?;
        } else {
            fs::remove_file(&readme_path)?;
        }
    }

    let mut readme_file = fs::OpenOptions::new().create(true).append(true).open(readme_path)?;
    let readme_notice = r#"
        This directory contains user-created widgets for UniChat. You can add your own widgets here.
        **DO NOT** delete or modify the `unichat.d.ts`, `jsconfig.json` files and `example` folder,
        they always will be replaced/restored to default if missing.

        Node: Folders starting with a dot (.) are hidden by default in the widget selector.
    "#;

    let formatted_readme_notice = readme_notice.lines().skip(1).map(|l| l.trim()).collect::<Vec<&str>>();
    writeln!(readme_file, "{}", formatted_readme_notice.join("\n"))?;

    /* ========================================================================================== */

    let http_server = actix::new(app);
    app.manage(actix::ActixState{ handle: http_server });

    /* ========================================================================================== */

    youtube::init(app)?;
    twitch::init(app)?;

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

#[tokio::main]
async fn main() {
    tauri::async_runtime::set(tokio::runtime::Handle::current());

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

    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_dialog::init())
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
            commands::dispatch_clear_chat,
            commands::get_app_info,
            commands::is_dev,
            commands::gallery::get_gallery_items,
            commands::gallery::upload_gallery_items,
            commands::store::store_get_item,
            commands::tour::get_prev_tour_steps,
            commands::tour::get_tour_steps,
            commands::tour::set_tour_steps,
            commands::tour::tour_steps_has_new,
            commands::scrappers::get_scrappers,
            commands::scrappers::get_scrapper,
            commands::scrappers::validate_scrapper_url,
            commands::scrappers::get_scrapper_stored_url,
            commands::scrappers::get_scrapper_webview_url,
            commands::scrappers::set_scrapper_webview_url,
            commands::scrappers::toggle_scrapper_webview,
            commands::widgets::get_widget_fields,
            commands::widgets::get_widget_fieldstate,
            commands::widgets::list_widgets,
            commands::widgets::set_widget_fieldstate
        ])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| panic!("Failed to run {} v{}!\n{:?}", CARGO_PKG_DISPLAY_NAME, CARGO_PKG_VERSION, e));
}
