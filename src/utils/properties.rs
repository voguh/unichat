/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::fmt;
use std::path::PathBuf;
use std::sync::OnceLock;
use std::sync::RwLock;

use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(PartialEq, Eq)]
pub enum PropertiesKey {
    YouTubeChannelId,
    TwitchChannelId
}

impl fmt::Display for PropertiesKey {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let s = match self {
            PropertiesKey::YouTubeChannelId => "youtube_channel_id",
            PropertiesKey::TwitchChannelId => "twitch_channel_id",
        };

        return write!(f, "{}", s);
    }
}

#[derive(PartialEq, Eq)]
pub enum AppPaths {
    AppCache,
    AppConfig,
    AppData,
    AppLocalData,
    AppLog,

    UniChatSystemWidget,
    UniChatUserWidgets,
    UniChatLogoIcon,
    UniChatLicense
}

impl fmt::Display for AppPaths {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let s = match self {
            AppPaths::AppCache => "app_cache_dir",
            AppPaths::AppConfig => "app_config_dir",
            AppPaths::AppData => "app_data_dir",
            AppPaths::AppLocalData => "app_local_data_dir",
            AppPaths::AppLog => "app_log_dir",

            AppPaths::UniChatSystemWidget => "unichat_system_widgets_dir",
            AppPaths::UniChatUserWidgets => "unichat_user_widgets_dir",
            AppPaths::UniChatLogoIcon => "unichat_logo_icon",
            AppPaths::UniChatLicense => "unichat_license"
        };

        return write!(f, "{}", s);
    }
}

static PROPERTIES: OnceLock<RwLock<HashMap<String, String>>> = OnceLock::new();

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    let app_cache_dir = app.path().app_cache_dir()?;
    let app_config_dir = app.path().app_config_dir()?;
    let app_data_dir = app.path().app_data_dir()?;
    let app_local_data_dir = app.path().app_local_data_dir()?;
    let app_log_dir = app.path().app_log_dir()?;
    let widget_defaults_dir = app.path().resolve("widgets", BaseDirectory::Resource)?;
    let widgets_dir = app.path().resolve("widgets", BaseDirectory::AppData)?;
    let logo_icon_file = app.path().resolve("icons/icon.png", BaseDirectory::Resource)?;
    let license_file = app.path().resolve("LICENSE", BaseDirectory::Resource)?;

    let app_cache_path = app_cache_dir.to_string_lossy().to_string();
    let app_config_path = app_config_dir.to_string_lossy().to_string();
    let app_data_path = app_data_dir.to_string_lossy().to_string();
    let app_local_data_path = app_local_data_dir.to_string_lossy().to_string();
    let app_log_path = app_log_dir.to_string_lossy().to_string();
    let widget_defaults_path = widget_defaults_dir.to_string_lossy().to_string();
    let widgets_path = widgets_dir.to_string_lossy().to_string();
    let logo_icon_path = logo_icon_file.to_string_lossy().to_string();
    let license_path = license_file.to_string_lossy().to_string();

    let mut properties = HashMap::new();
    properties.insert(AppPaths::AppCache.to_string(), app_cache_path);
    properties.insert(AppPaths::AppConfig.to_string(), app_config_path);
    properties.insert(AppPaths::AppData.to_string(), app_data_path);
    properties.insert(AppPaths::AppLocalData.to_string(), app_local_data_path);
    properties.insert(AppPaths::AppLog.to_string(), app_log_path);
    properties.insert(AppPaths::UniChatSystemWidget.to_string(), widget_defaults_path);
    properties.insert(AppPaths::UniChatUserWidgets.to_string(), widgets_path);
    properties.insert(AppPaths::UniChatLogoIcon.to_string(), logo_icon_path);
    properties.insert(AppPaths::UniChatLicense.to_string(), license_path);

    let result = PROPERTIES.set(RwLock::new(properties));
    if result.is_err() {
        return Err("Failed to initialize properties".into());
    }

    return Ok(());
}

fn get_item_raw(key: String) -> Result<String, Box<dyn std::error::Error>> {
    let props = PROPERTIES.get().ok_or("Properties not initialized")?;
    let props_guard = props.read()?;
    return props_guard.get(&key).cloned().ok_or(format!("Key '{}' not found", key).into());
}

pub fn get_item(key: PropertiesKey) -> Result<String, Box<dyn std::error::Error>> {
    return get_item_raw(key.to_string());
}

pub fn set_item(key: PropertiesKey, value: String) -> Result<(), Box<dyn std::error::Error>> {
    let props = PROPERTIES.get().ok_or("Properties not initialized")?;
    let mut props_guard = props.write()?;
    props_guard.insert(key.to_string(), value);

    return Ok(());
}

pub fn get_app_path(key: AppPaths) -> PathBuf {
    let path_str = get_item_raw(key.to_string()).expect("Failed to get app path");
    return PathBuf::from(path_str);
}
