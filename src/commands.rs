use std::{str::FromStr, sync::{Arc, Mutex}, thread::sleep};

use tauri::{Manager, PhysicalSize, Runtime};
use tokio::task::JoinHandle;
use warp::Filter;

use crate::youtube;

#[tauri::command]
pub fn show_webview<R: Runtime>(app: tauri::AppHandle<R>, label: &str) {
    if std::env::consts::OS != "linux" {
        let window = app.get_window("main").unwrap();
        let window_size = window.inner_size().unwrap();

        for (key, value) in app.webviews() {
            if key != "main" && key != label {
                value.hide().unwrap();
            }
        }

        let size = PhysicalSize::new(64, window_size.height);
        app.get_webview("main").unwrap().set_size(size).unwrap();

        let webview = app.get_webview(label).unwrap();
        webview.show().unwrap();
    } else {
        for (key, value) in app.webview_windows() {
            if key != "main" && key != label {
                value.hide().unwrap();
            }
        }

        let webview_window = app.get_webview_window(label).unwrap();
        webview_window.show().unwrap();
    }
}

#[tauri::command]
pub fn hide_webviews(app: tauri::AppHandle) {
    if std::env::consts::OS != "linux" {
        let window = app.get_window("main").unwrap();
        let window_size = window.inner_size().unwrap();

        for (key, value) in app.webviews() {
            if key != "main" {
                value.hide().unwrap();
            }
        }

        let webview = app.get_webview("main").unwrap();
        webview.set_size(window_size).unwrap();
    } else {
        for (key, value) in app.webview_windows() {
            if key != "main" {
                value.hide().unwrap();
            }
        }
    }
}

#[tauri::command]
pub async fn update_webview_url<R: Runtime>(app: tauri::AppHandle<R>, label: &str, url: &str) -> Result<(), String> {
    let mut webview = app.get_webview(label).unwrap();

    webview.navigate(tauri::Url::from_str(url).unwrap()).unwrap();
    sleep(std::time::Duration::from_secs(2));
    if label == "youtube-chat" && url != "about:blank" {
        webview.eval(youtube::SCRAPPING_JS).unwrap();
    }

    Ok(())
}

/* ================================================================================================================== */

pub type ServerHandle = JoinHandle<()>;

#[derive(Default)]
pub struct ServerState {
    handle: Arc<Mutex<Option<ServerHandle>>>,
}

#[tauri::command]
pub async fn start_overlay_server<R: Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    let widgets_dir = warp::fs::dir(app.path().app_data_dir().unwrap().join("widgets"));

    let handle = tokio::spawn(async move {
        warp::serve(warp::path("widgets").and(widgets_dir)).run(([127, 0, 0, 1], 9527)).await;
    });

    let state = app.state::<ServerState>();
    *state.handle.lock().unwrap() = Some(handle);

    Ok(())
}

#[tauri::command]
pub async fn stop_overlay_server<R: Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    let state = app.state::<ServerState>();
    let mut handle = state.handle.lock().unwrap();

    if let Some(h) = handle.take() {
        h.abort();
        Ok(())
    } else {
        Err("Server is not running".into())
    }
}

#[tauri::command]
pub async fn overlay_server_status<R: Runtime>(app: tauri::AppHandle<R>) -> Result<bool, String> {
    let state = app.state::<ServerState>();
    let handle = state.handle.lock().unwrap();

    Ok(handle.is_some())
}

#[tauri::command]
pub async fn list_overlay_widgets<R: Runtime>(app: tauri::AppHandle<R>) -> Result<Vec<String>, String> {
    let widgets_dir = app.path().app_data_dir().unwrap().join("widgets");


    if widgets_dir.is_dir() {
        let mut folders: Vec<String> = Vec::new();

        let entries = std::fs::read_dir(&widgets_dir).unwrap();
        for entry in entries {
            let path = entry.unwrap().path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    folders.push(name.to_string());
                }
            }
        }

        Ok(folders)
    } else {
        Err(String::from_str("An error occurred on iterate over widgets dir").unwrap())
    }

}
