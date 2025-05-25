use std::str::FromStr;
use std::thread::sleep;

use tauri::{Manager, Runtime};

use crate::youtube;

#[tauri::command]
pub fn toggle_webview<R: Runtime>(app: tauri::AppHandle<R>, label: &str) -> Result<(), String> {
    let webview_window = app.get_webview_window(label).unwrap();
    if webview_window.is_visible().map_err(|e| format!("{:?}", e))? {
        webview_window.hide().map_err(|e| format!("{:?}", e))?;
    } else {
        webview_window.show().map_err(|e| format!("{:?}", e))?;

    }

    return Ok(());
}

#[tauri::command]
pub async fn update_webview_url<R: Runtime>(app: tauri::AppHandle<R>, label: &str, url: &str) -> Result<(), String> {
    let window = app.get_webview_window(label).unwrap();

    window.eval(format!("window.location.href = '{}'", url)).unwrap();
    sleep(std::time::Duration::from_secs(2));
    if label == "youtube-chat" && url != "about:blank" {
        window.eval(youtube::SCRAPPING_JS).unwrap();
    }

    return Ok(());
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

        return Ok(folders);
    } else {
        Err(String::from_str("An error occurred on iterate over overlays dir").unwrap())
    }

}

/* ================================================================================================================== */

#[tauri::command]
pub async fn open_overlays_dir<R: Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    let overlays_dir = app.path().app_data_dir().unwrap().join("overlays");
    showfile::show_path_in_file_manager(overlays_dir);

    return Ok(());
}
