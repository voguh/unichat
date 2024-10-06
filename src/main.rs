// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

use tauri::{LogicalPosition, LogicalSize, Manager, WebviewBuilder, WebviewUrl, WebviewWindowBuilder};

mod commands;
mod events;
mod youtube;
mod webserver;

fn create_webview<R: tauri::Runtime>(app: &tauri::App<R>, window: &tauri::Window<R>, label: &str, url: WebviewUrl) {
    let window_pos = window.inner_position().unwrap();
    let window_size = window.inner_size().unwrap();

    let pos = LogicalPosition::new(64, 0);
    let size = LogicalSize::new(window_size.width - 64, window_size.height);

    if std::env::consts::OS != "linux" {
        let new_webview = window.add_child(WebviewBuilder::new(label, url), pos, size).unwrap();
        new_webview.hide().unwrap();
    } else {
        let webview_window = app.get_webview_window("main").unwrap();

        let new_window = WebviewWindowBuilder::new(app, label, url)
            .inner_size(size.width as f64, size.height as f64).position((window_pos.x + pos.x) as f64, (window_pos.y + pos.y) as f64)
            .resizable(false).decorations(false).parent(&webview_window).unwrap().build().unwrap();

        new_window.hide().unwrap();
    }
}

fn setup<R: tauri::Runtime>(app: &mut tauri::App<R>) -> Result<(), Box<dyn std::error::Error>> {
    let overlays_dir = app.path().app_data_dir().unwrap().join("overlays");
    if !&overlays_dir.exists() {
        fs::create_dir(&overlays_dir).unwrap();
    }

    let runtime = tokio::runtime::Runtime::new().unwrap();
    let handle = runtime.spawn(async move {
        actix_web::HttpServer::new(move || {
            actix_web::App::new().wrap(actix_web::middleware::Logger::default())
                .service(webserver::routes::ws)
                .service(actix_files::Files::new("/overlays", &overlays_dir).prefer_utf8(true).index_file("index.html"))
        }).bind(("127.0.0.1", 9527)).unwrap().run().await.unwrap()
    });

    let state = app.state::<webserver::WebServerState>();
    *state.handle.lock().unwrap() = Some(handle);

    /* ========================================================================================== */

    let window = app.get_window("main").unwrap();
    create_webview(app, &window, "youtube-chat", WebviewUrl::External("https://youtube.com".parse().unwrap()));
    create_webview(app, &window, "twitch-chat", WebviewUrl::External("https://twitch.tv".parse().unwrap()));

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
            tauri::WindowEvent::CloseRequested { .. } => {
                let state = app.state::<webserver::WebServerState>();
                let mut web_server_handle = state.handle.lock().unwrap();
                if let Some(h) = web_server_handle.take() {
                    h.abort();
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

fn main() {
    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(webserver::WebServerState::default())
        .invoke_handler(tauri::generate_handler![
            commands::show_webview,
            commands::hide_webviews,
            commands::update_webview_url,
            commands::list_overlays,
            youtube::on_youtube_message
        ])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .expect("Error while running UniChat application");
}
