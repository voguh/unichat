/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2026 Voguh <voguhofc@protonmail.com>
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

use crate::actix::ActixState;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

include!(concat!(env!("CARGO_MANIFEST_DIR"), "/target/gen/metadata.rs"));

mod actix;
mod commands;
mod events;
mod plugins;
mod scraper;
mod shared_emotes;
mod twitch;
mod utils;
mod widgets;
mod youtube;

pub static STATIC_APP_ICON: &[u8] = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/icons/icon.png"));
pub static THIRD_PARTY_LICENSES: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/target/gen/third_party_licenses.json"));
static APP_HANDLE: OnceLock<tauri::AppHandle<tauri::Wry>> = OnceLock::new();

pub fn get_app_handle() -> &'static tauri::AppHandle<tauri::Wry> {
    return APP_HANDLE.get().expect("APP_HANDLE is not initialized");
}

fn rm_util(path: &PathBuf) -> Result<(), Error> {
    if path.exists() {
        if path.is_dir() {
            fs::remove_dir_all(path)?;
        } else {
            fs::remove_file(path)?;
        }
    }

    return Ok(());
}

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
    rm_util(dest)?;

    if src.is_dir() {
        copy_folder(src, dest)?;
    } else {
        fs::copy(src, dest)?;
    }

    return Ok(());
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

    log_startup_process(&splash_screen, "[01/21] Initializing properties...");
    utils::properties::init()?;
    log_startup_process(&splash_screen, "[02/21] Initializing settings...");
    utils::settings::init()?;

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[03/21] Setting up application plugins directory...");
    let system_plugins_dir = properties::get_app_path(AppPaths::UniChatSystemPlugins);
    let user_plugins_dir = properties::get_app_path(AppPaths::UniChatUserPlugins);
    if !&user_plugins_dir.exists() {
        log::info!("Creating user plugins directory at {:?}", &user_plugins_dir);
        fs::create_dir_all(&user_plugins_dir)?;
    }

    log_startup_process(&splash_screen, "[04/21] Copying plugin types to user plugins directory...");
    let plugin_types_source = system_plugins_dir.join(".types");
    let plugin_types_dest = user_plugins_dir.join(".types");
    copy_wrapper(&plugin_types_source, &plugin_types_dest)?;

    log_startup_process(&splash_screen, "[05/21] Copying plugin .luarc.json to user plugins directory...");
    let plugin_luarc_source = system_plugins_dir.join(".luarc.json");
    let plugin_luarc_dest = user_plugins_dir.join(".luarc.json");
    copy_wrapper(&plugin_luarc_source, &plugin_luarc_dest)?;

    log_startup_process(&splash_screen, "[06/21] Creating README.md in user plugins directory...");
    let readme_path = user_plugins_dir.join("README.md");
    rm_util(&readme_path)?;

    let readme_notice = r#"
        This directory contains user-added plugins for UniChat. You can add your own plugins here.
        **DO NOT** delete or modify the `.luarc.json` files and `.types` folder, they always will
        be replaced/restored to default if missing.

        Note: Folders must contain only ASCII alphanumeric characters, underscores (_) and hyphens (-). Folders starting with a dot (.) are ignored by default.
    "#;

    let formatted_readme_notice = readme_notice.lines().skip(1).map(|l| l.trim()).collect::<Vec<&str>>();
    fs::write(readme_path, formatted_readme_notice.join("\n"))?;

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[07/21] Setting up application gallery directory...");
    let gallery_dir = properties::get_app_path(AppPaths::UniChatGallery);
    if !&gallery_dir.exists() {
        log::info!("Creating gallery directory at {:?}", &gallery_dir);
        fs::create_dir_all(&gallery_dir)?;
    }

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[08/21] Setting up application widgets directory...");
    let system_widgets_dir = properties::get_app_path(AppPaths::UniChatSystemWidgets);
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !&user_widgets_dir.exists() {
        log::info!("Creating user widgets directory at {:?}", &user_widgets_dir);
        fs::create_dir_all(&user_widgets_dir)?;
    }

    log_startup_process(&splash_screen, "[09/21] Copying default widget to user widgets directory...");
    let example_widget_path_source = system_widgets_dir.join("default");
    let example_widget_path_dest = user_widgets_dir.join("example");
    copy_wrapper(&example_widget_path_source, &example_widget_path_dest)?;

    log_startup_process(&splash_screen, "[10/21] Copying widget types to user widgets directory...");
    let unichat_d_ts_path_source = system_widgets_dir.join("unichat.d.ts");
    let unichat_d_ts_path_dest = user_widgets_dir.join("unichat.d.ts");
    copy_wrapper(&unichat_d_ts_path_source, &unichat_d_ts_path_dest)?;

    log_startup_process(&splash_screen, "[11/21] Copying jsconfig.json to user widgets directory...");
    let jsconfig_json_path_source = system_widgets_dir.join("jsconfig.json");
    let jsconfig_json_path_dest = user_widgets_dir.join("jsconfig.json");
    copy_wrapper(&jsconfig_json_path_source, &jsconfig_json_path_dest)?;

    log_startup_process(&splash_screen, "[12/21] Creating README.md in user widgets directory...");
    let readme_path = user_widgets_dir.join("README.md");
    rm_util(&readme_path)?;

    let readme_notice = r#"
        This directory contains user-added widgets for UniChat. You can add your own widgets here.
        **DO NOT** delete or modify the `unichat.d.ts`, `jsconfig.json` files and `example` folder,
        they always will be replaced/restored to default if missing.

        Note: Folders must contain only ASCII alphanumeric characters, underscores (_) and hyphens (-). Folders starting with a dot (.) are ignored by default.
    "#;

    let formatted_readme_notice = readme_notice.lines().skip(1).map(|l| l.trim()).collect::<Vec<&str>>();
    fs::write(readme_path, formatted_readme_notice.join("\n"))?;

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[13/21] Initializing events emitter module...");
    events::init()?;

    log_startup_process(&splash_screen, "[14/21] Initializing plugins module...");
    plugins::init()?;

    log_startup_process(&splash_screen, "[16/21] Initializing userstore module...");
    utils::userstore::init()?;

    log_startup_process(&splash_screen, "[17/21] Initializing widgets module...");
    widgets::init()?;

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[18/21] Initializing HTTP server...");
    let http_server = actix::new();
    app_handle.manage(http_server);

    /* ========================================================================================== */

    log_startup_process(&splash_screen, "[19/21] Registering Twitch integration...");
    twitch::init()?;
    log_startup_process(&splash_screen, "[20/21] Registering YouTube integration...");
    youtube::init()?;

    log_startup_process(&splash_screen, "[21/21] Loading plugins...");
    plugins::load_plugins()?;

    let end = Instant::now();
    let duration = end.duration_since(start);
    log_startup_process(&splash_screen, format!("Setup completed successfully in {:.2?}.", duration));

    /* ========================================================================================== */

    let main_url = tauri::WebviewUrl::App("index.html".into());
    let window = WebviewWindowBuilder::new(app_handle, "main", main_url)
        .title(format!("{} v{}", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION))
        .inner_size(1024.0, 576.0)
        .min_inner_size(1024.0, 576.0)
        .max_inner_size(1280.0, 720.0)
        .maximizable(false)
        .center()
        .build()?;

    if !window.is_visible()? {
        window.show()?;
    }

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
            if let Some(splash_screen) = app.get_webview_window("splash-screen") {
                let _ = splash_screen.close();
            }
        }
    });

    return Ok(());
}

fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    let app = window.app_handle();

    if window.label() == "main" || window.label() == "splash-screen" {
        if let tauri::WindowEvent::Destroyed = event {
            let http_server: tauri::State<'_, ActixState> = app.state();
            http_server.stop();

            for (key, window) in app.webview_windows() {
                if key != "main" {
                    window.destroy().unwrap();
                }
            }
        }
    } else if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        if window.label().ends_with("-chat") {
            api.prevent_close();
            window.hide().unwrap();
        }
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
            .target(tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir { file_name: Some(UNICHAT_NAME.to_string()) }))
            .build()
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::dispatch_clear_chat,
            commands::get_app_info,
            commands::get_releases,
            commands::get_system_hosts,
            commands::is_dev,
            commands::gallery::get_gallery_items,
            commands::gallery::upload_gallery_items,
            commands::plugins::get_plugins,
            commands::store::settings_get_item,
            commands::store::settings_set_item,
            commands::store::store_get_item,
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
            commands::widgets::get_widget_fields,
            commands::widgets::get_widget_fieldstate,
            commands::widgets::list_detailed_widgets,
            commands::widgets::list_widgets,
            commands::widgets::reload_widgets,
            commands::widgets::set_widget_fieldstate,
        ])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| panic!("Failed to run {} v{}!\n{:?}", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION, e));
}
