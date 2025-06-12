use std::collections::HashMap;
use std::fmt;
use std::path::PathBuf;
use std::sync::OnceLock;

use tauri::Manager;

#[derive(PartialEq, Eq)]
pub enum AppPaths {
    AppCacheDir,
    AppConfigDir,
    AppDataDir,
    AppLocalDataDir,
    AppLogDir,

    UniChatWidgetsDir,
}

impl fmt::Display for AppPaths {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let s = match self {
            AppPaths::AppCacheDir => "app_cache_dir",
            AppPaths::AppConfigDir => "app_config_dir",
            AppPaths::AppDataDir => "app_data_dir",
            AppPaths::AppLocalDataDir => "app_local_data_dir",
            AppPaths::AppLogDir => "app_log_dir",
            AppPaths::UniChatWidgetsDir => "unichat_widgets_dir",
        };

        return write!(f, "{}", s);
    }
}

static PROPERTIES: OnceLock<HashMap<String, String>> = OnceLock::new();

pub fn init(app: &mut tauri::App<tauri::Wry>) {
    let app_cache_dir = app.path().app_cache_dir().unwrap().to_string_lossy().to_string();
    let app_config_dir = app.path().app_config_dir().unwrap().to_string_lossy().to_string();
    let app_data_dir = app.path().app_data_dir().unwrap().to_string_lossy().to_string();
    let app_local_data_dir = app.path().app_local_data_dir().unwrap().to_string_lossy().to_string();
    let app_log_dir = app.path().app_log_dir().unwrap().to_string_lossy().to_string();
    let widgets_dir = PathBuf::from(&app_data_dir).join("widgets").to_string_lossy().to_string();

    PROPERTIES.get_or_init(move || {
        let mut properties = HashMap::new();

        properties.insert(AppPaths::AppCacheDir.to_string(), app_cache_dir);
        properties.insert(AppPaths::AppConfigDir.to_string(), app_config_dir);
        properties.insert(AppPaths::AppDataDir.to_string(), app_data_dir);
        properties.insert(AppPaths::AppLocalDataDir.to_string(), app_local_data_dir);
        properties.insert(AppPaths::AppLogDir.to_string(), app_log_dir);
        properties.insert(AppPaths::UniChatWidgetsDir.to_string(), widgets_dir);

        return properties;
    });
}

pub fn get(key: String) -> Option<&'static str> {
    return PROPERTIES.get()
        .and_then(|props| props.get(&key).map(String::as_str));
}

pub fn get_app_path(key: AppPaths) -> PathBuf {
    let path_str = get(key.to_string()).expect("Failed to get app path");
    return PathBuf::from(path_str);
}
