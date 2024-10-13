// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

use tauri::{LogicalPosition, LogicalSize, Manager};

mod actix;
mod commands;
mod events;
mod render;
mod youtube;

fn setup<R: tauri::Runtime>(app: &mut tauri::App<R>) -> Result<(), Box<dyn std::error::Error>> {
    let overlays_dir = app.path().app_data_dir().unwrap().join("overlays");
    if !&overlays_dir.exists() {
        fs::create_dir_all(&overlays_dir).unwrap();
    }

    actix::register_actix(app, overlays_dir);

    /* ========================================================================================== */

    let window = app.get_window("main").unwrap();
    render::create_render(app, &window, "youtube-chat", String::from("https://youtube.com"));

    Ok(())
}

fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if std::env::consts::OS == "linux" && window.label() == "main" {
        let app = window.app_handle();

        match event {
            tauri::WindowEvent::Moved(window_pos) => {
                let pos = LogicalPosition::new(window_pos.x + 64, window_pos.y);
                for (key, window) in app.windows() {
                    if key != "main" {
                        window.set_position(pos).unwrap();
                    }
                }
            }

            tauri::WindowEvent::Resized(window_size) => {
                let size = LogicalSize::new(window_size.width - 64, window_size.height);
                for (key, window) in app.windows() {
                    if key != "main" {
                        window.set_size(size).unwrap()
                    }
                }
            }

            tauri::WindowEvent::Destroyed => {
                let state = app.state::<actix::ActixState>();
                let mut actix_handler = state.handle.lock().unwrap();
                if let Some(handler) = actix_handler.take() {
                    handler.abort();
                }

                for (key, window) in app.windows() {
                    if key != "main" {
                        window.destroy().unwrap();
                    }
                }
            }

            _ => {}
        }
    }
}

#[tokio::main]
async fn main() {
    tauri::async_runtime::set(tokio::runtime::Handle::current());
    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(actix::ActixState::default())
        .invoke_handler(tauri::generate_handler![
            commands::show_webview,
            commands::hide_webviews,
            commands::update_webview_url,
            commands::list_overlays,
            commands::open_overlays_dir,
            youtube::on_youtube_message
        ])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .expect("Error while running UniChat application");
}
