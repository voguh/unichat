// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

use tauri::Manager;

mod actix;
mod commands;
mod events;
mod store;
mod youtube;

fn setup<R: tauri::Runtime>(app: &mut tauri::App<R>) -> Result<(), Box<dyn std::error::Error>> {
    let overlays_dir = app.path().app_data_dir().unwrap().join("overlays");
    if !&overlays_dir.exists() {
        fs::create_dir_all(&overlays_dir).unwrap();
    }

    /* ========================================================================================== */

    events::init(app);

    /* ========================================================================================== */

    let store = store::new(app);
    app.manage(store);

    /* ========================================================================================== */

    let http_server = actix::new(app, overlays_dir);
    app.manage(actix::ActixState{ handle: http_server });

    return Ok(());
}

fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    let app = window.app_handle();

    if window.label() == "main" {
        match event {
            tauri::WindowEvent::Destroyed => {
                let actix = app.state::<actix::ActixState>();
                actix.handle.abort();

                for (key, window) in app.webview_windows() {
                    if key != "main" {
                        window.destroy().unwrap();
                    }
                }
            }

            _ => {}
        }
    } else {
        match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                window.hide().unwrap();
            }

            _ => {}
        }
    }
}

fn main() {
    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_log::Builder::new().level(log::LevelFilter::Info).build())
        .invoke_handler(tauri::generate_handler![
            commands::store_get_item,
            commands::store_set_item,
            commands::toggle_webview,
            commands::update_webview_url,
            commands::list_overlays,
            commands::open_overlays_dir,
            youtube::on_youtube_channel_id,
            youtube::on_youtube_idle,
            youtube::on_youtube_ready,
            youtube::on_youtube_ping,
            youtube::on_youtube_error,
            youtube::on_youtube_message
        ])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .expect("Error while running UniChat application");
}
