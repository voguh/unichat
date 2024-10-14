use std::{str::FromStr, thread::sleep};

use tauri::{LogicalPosition, LogicalSize, Manager, PhysicalSize, Runtime};

use crate::youtube;

#[tauri::command]
pub fn show_webview<R: Runtime>(app: tauri::AppHandle<R>, label: &str) {
    let window = app.get_window("main").unwrap();

    if std::env::consts::OS != "linux" {
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

        let window_pos = window.inner_position().unwrap();
        let pos = LogicalPosition::new(window_pos.x + 64, window_pos.y);
        webview_window.set_position(pos).unwrap();

        let window_size = window.inner_size().unwrap();
        let size = LogicalSize::new(window_size.width - 64, window_size.height);
        webview_window.set_size(size).unwrap();
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

#[tauri::command]
pub async fn list_overlays<R: Runtime>(app: tauri::AppHandle<R>) -> Result<Vec<String>, String> {
    let overlays_dir = app.path().app_data_dir().unwrap().join("overlays");


    if overlays_dir.is_dir() {
        let mut folders: Vec<String> = Vec::new();

        let entries = std::fs::read_dir(&overlays_dir).unwrap();
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
        Err(String::from_str("An error occurred on iterate over overlays dir").unwrap())
    }

}

/* ================================================================================================================== */

#[tauri::command]
pub async fn open_overlays_dir<R: Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    let overlays_dir = app.path().app_data_dir().unwrap().join("overlays");

    showfile::show_path_in_file_manager(overlays_dir);

    Ok(())
}
