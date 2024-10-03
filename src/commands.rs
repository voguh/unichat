use std::{str::FromStr, thread::sleep};

use tauri::{Manager, PhysicalSize};

use crate::youtube;

#[tauri::command]
pub fn show_webview(app: tauri::AppHandle, label: &str) {
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
pub async fn update_webview_url(app: tauri::AppHandle, label: &str, url: &str) -> Result<(), String> {
    let mut webview = app.get_webview(label).unwrap();

    webview.navigate(tauri::Url::from_str(url).unwrap()).unwrap();
    sleep(std::time::Duration::from_secs(2));
    if label == "youtube-chat" && url != "about:blank" {
        webview.eval(youtube::SCRAPPING_JS).unwrap();
    }

    Ok(())
}
