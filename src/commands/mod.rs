use std::str::FromStr;
use std::thread::sleep;

use serde_json::Value;
use tauri::Manager;
use tauri::Runtime;

use crate::utils;
use crate::utils::constants;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::settings;
use crate::utils::settings::SettingsKeys;
use crate::youtube;

#[tauri::command]
pub async fn store_get_item<R: tauri::Runtime>(_app: tauri::AppHandle<R>, key: &str) -> Result<Value, String> {
    if key.starts_with("settings") {
        return Err(String::from("Use `settings_get_item` for settings keys"));
    }

    let p_key = SettingsKeys::from_str(key)?;
    return settings::get_item(p_key);
}

#[tauri::command]
pub async fn store_set_item<R: tauri::Runtime>(_app: tauri::AppHandle<R>, key: &str, value: Value) -> Result<(), String> {
    if key.starts_with("settings") {
        return Err(String::from("Use `settings_set_item` for settings keys"));
    }

    let p_key = SettingsKeys::from_str(key)?;
    return settings::set_item(p_key, value);
}

#[tauri::command]
pub async fn settings_list_all<R: tauri::Runtime>(_app: tauri::AppHandle<R>) -> Result<Value, String> {
    let keys = SettingsKeys::list_all_with_prefix("settings.");
    let mut value_map = serde_json::Map::new();
    for key in keys {
        let value = settings::get_item(key)?;
        value_map.insert(key.to_string().replace("string.", ""), value);
    }

    return Ok(Value::Object(value_map));
}

#[tauri::command]
pub async fn settings_get_item<R: tauri::Runtime>(_app: tauri::AppHandle<R>, key: &str) -> Result<Value, String> {
    let settings_key = format!("settings.{}", key);
    let p_key = SettingsKeys::from_str(&settings_key)?;
    return settings::get_item(p_key);
}

#[tauri::command]
pub async fn settings_set_item<R: tauri::Runtime>(_app: tauri::AppHandle<R>, key: &str, value: Value) -> Result<(), String> {
    let skey = format!("settings.{}", key);
    let p_key = SettingsKeys::from_str(&skey)?;
    return settings::set_item(p_key, value);
}

/* ================================================================================================================== */

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

    let tauri_url: tauri::Url;
    if url == "about:blank" {
        if utils::is_dev() {
            tauri_url = tauri::Url::parse("http://localhost:1421/youtube-await.html").map_err(|e| format!("{:?}", e))?;
        } else {
            tauri_url = tauri::Url::parse("tauri://localhost/youtube-await.html").map_err(|e| format!("{:?}", e))?;
        }
    } else {
        tauri_url = tauri::Url::parse(url).map_err(|e| format!("{:?}", e))?;
    }

    window.navigate(tauri_url).map_err(|e| format!("{:?}", e))?;
    sleep(std::time::Duration::from_secs(2));
    if label == constants::YOUTUBE_CHAT_WINDOW && url != "about:blank" {
        window.eval(youtube::SCRAPPING_JS).unwrap();
    }

    return Ok(());
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn list_widgets<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Vec<String>, String> {
    let widgets_dir = properties::get_app_path(AppPaths::UniChatWidgetsDir);
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

        return Ok(folders);
    } else {
        Err(String::from_str("An error occurred on iterate over widgets dir").unwrap())
    }
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn open_widgets_dir<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<(), String> {
    let widgets_dir = properties::get_app_path(AppPaths::UniChatWidgetsDir);
    showfile::show_path_in_file_manager(widgets_dir);

    return Ok(());
}
