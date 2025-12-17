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

use crate::error::Error;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PropertiesKey {
    YouTubeChannelId,
    TwitchChannelId
}

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AppPaths {
    AppCache,
    AppConfig,
    AppData,
    AppLocalData,
    AppLog,

    UniChatAssets,
    UniChatGallery,
    UniChatSystemWidgets,
    UniChatUserWidgets,
    UniChatSystemPlugins,
    UniChatUserPlugins,
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

            AppPaths::UniChatAssets => "unichat_assets_dir",
            AppPaths::UniChatGallery => "unichat_gallery_dir",
            AppPaths::UniChatSystemWidgets => "unichat_system_widgets_dir",
            AppPaths::UniChatUserWidgets => "unichat_user_widgets_dir",
            AppPaths::UniChatSystemPlugins => "unichat_system_plugins_dir",
            AppPaths::UniChatUserPlugins => "unichat_user_plugins_dir",
            AppPaths::UniChatLogoIcon => "unichat_logo_icon",
            AppPaths::UniChatLicense => "unichat_license"
        };

        return write!(f, "{}", s);
    }
}

const ONCE_LOCK_NAME: &str = "Properties::INSTANCE";
static INSTANCE: OnceLock<RwLock<HashMap<String, String>>> = OnceLock::new();

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    let app_cache_dir = app.path().app_cache_dir()?;
    let app_config_dir = app.path().app_config_dir()?;
    let app_data_dir = app.path().app_data_dir()?;
    let app_local_data_dir = app.path().app_local_data_dir()?;
    let app_log_dir = app.path().app_log_dir()?;
    let assets_dir = app.path().resolve("assets", BaseDirectory::Resource)?;
    let gallery_dir = app.path().resolve("gallery", BaseDirectory::AppData)?;
    let system_widgets_dir = app.path().resolve("widgets", BaseDirectory::Resource)?;
    let user_widgets_dir = app.path().resolve("widgets", BaseDirectory::AppData)?;
    let system_plugins_dir = app.path().resolve("plugins", BaseDirectory::Resource)?;
    let user_plugins_dir = app.path().resolve("plugins", BaseDirectory::AppData)?;
    let logo_icon_file = app.path().resolve("icons/icon.png", BaseDirectory::Resource)?;
    let license_file = app.path().resolve("LICENSE", BaseDirectory::Resource)?;

    let app_cache_path = app_cache_dir.to_string_lossy().to_string();
    let app_config_path = app_config_dir.to_string_lossy().to_string();
    let app_data_path = app_data_dir.to_string_lossy().to_string();
    let app_local_data_path = app_local_data_dir.to_string_lossy().to_string();
    let app_log_path = app_log_dir.to_string_lossy().to_string();
    let assets_path = assets_dir.to_string_lossy().to_string();
    let gallery_path = gallery_dir.to_string_lossy().to_string();
    let system_widgets_path = system_widgets_dir.to_string_lossy().to_string();
    let user_widgets_path = user_widgets_dir.to_string_lossy().to_string();
    let system_plugins_path = system_plugins_dir.to_string_lossy().to_string();
    let user_plugins_path = user_plugins_dir.to_string_lossy().to_string();
    let logo_icon_path = logo_icon_file.to_string_lossy().to_string();
    let license_path = license_file.to_string_lossy().to_string();

    let mut properties = HashMap::new();
    properties.insert(AppPaths::AppCache.to_string(), app_cache_path);
    properties.insert(AppPaths::AppConfig.to_string(), app_config_path);
    properties.insert(AppPaths::AppData.to_string(), app_data_path);
    properties.insert(AppPaths::AppLocalData.to_string(), app_local_data_path);
    properties.insert(AppPaths::AppLog.to_string(), app_log_path);
    properties.insert(AppPaths::UniChatAssets.to_string(), assets_path);
    properties.insert(AppPaths::UniChatGallery.to_string(), gallery_path);
    properties.insert(AppPaths::UniChatSystemWidgets.to_string(), system_widgets_path);
    properties.insert(AppPaths::UniChatUserWidgets.to_string(), user_widgets_path);
    properties.insert(AppPaths::UniChatSystemPlugins.to_string(), system_plugins_path);
    properties.insert(AppPaths::UniChatUserPlugins.to_string(), user_plugins_path);
    properties.insert(AppPaths::UniChatLogoIcon.to_string(), logo_icon_path);
    properties.insert(AppPaths::UniChatLicense.to_string(), license_path);

    let result = INSTANCE.set(RwLock::new(properties));
    if result.is_err() {
        return Err("Failed to initialize properties".into());
    }

    return Ok(());
}

fn get_item_raw(key: String) -> Result<String, Error> {
    let props = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;
    let props_guard = props.read().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;
    return props_guard.get(&key).cloned().ok_or(format!("Key '{}' not found", key).into());
}

pub fn get_item(key: PropertiesKey) -> Result<String, Error> {
    let key = serde_plain::to_string(&key)?;
    return get_item_raw(key);
}

pub fn set_item(key: PropertiesKey, value: String) -> Result<(), Error> {
    let props = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    if let Ok(mut props) = props.write() {
        let key = serde_plain::to_string(&key)?;
        props.insert(key.to_string(), value);

        return Ok(());
    } else {
        return Err(Error::from("Failed to acquire write lock on properties"));
    }
}

pub fn get_app_path(key: AppPaths) -> PathBuf {
    let key = serde_plain::to_string(&key).expect("Failed to serialize AppPaths key");
    let path_str = get_item_raw(key).expect("Failed to get app path");
    return PathBuf::from(path_str);
}
