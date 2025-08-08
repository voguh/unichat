/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::sync::Arc;
use std::sync::OnceLock;

use serde::Deserialize;
use serde::Serialize;
use serde_json::Value;
use tauri_plugin_store::Store;
use tauri_plugin_store::StoreBuilder;

use crate::utils::properties;
use crate::utils::properties::AppPaths;

#[derive(Serialize, Deserialize, Debug, Eq, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SettingLogEventLevel {
    OnlyErrors,
    UnknownEvents,
    AllEvents
}

#[derive(Serialize, Deserialize, Debug, Eq, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum SettingsKeys {
    YouTubeVideoId,
    TwitchChannelName,

    #[serde(rename = "settings.requires-tour")]
    RequiresTour,
    #[serde(rename = "settings.log-youtube-events")]
    LogYouTubeEvents,
    #[serde(rename = "settings.log-twitch-events")]
    LogTwitchEvents
}

impl SettingsKeys {
    pub fn from_str(key: &str) -> Result<Self, String> {
        return serde_plain::from_str(key).map_err(|e| format!("{:?}", e));
    }

    pub fn to_string(&self) -> String {
        return serde_plain::to_string(self).unwrap();
    }
}

static INSTANCE: OnceLock<Arc<Store<tauri::Wry>>> = OnceLock::new();

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    let mut defaults = HashMap::new();
    defaults.insert(SettingsKeys::YouTubeVideoId.to_string(), Value::from(""));
    defaults.insert(SettingsKeys::TwitchChannelName.to_string(), Value::from(""));

    defaults.insert(SettingsKeys::RequiresTour.to_string(), Value::from(true));
    defaults.insert(SettingsKeys::LogYouTubeEvents.to_string(), serde_json::to_value(SettingLogEventLevel::OnlyErrors).unwrap());
    defaults.insert(SettingsKeys::LogTwitchEvents.to_string(), serde_json::to_value(SettingLogEventLevel::OnlyErrors).unwrap());

    let store_path = properties::get_app_path(AppPaths::AppConfig).join("settings.json");

    let result = INSTANCE.set(StoreBuilder::new(app, store_path).defaults(defaults).build().unwrap());
    if result.is_err() {
        return Err("Failed to initialize settings store".into());
    }

    return Ok(());
}

pub fn get_item<T: serde::de::DeserializeOwned>(key: SettingsKeys) -> Result<T, String> {
    let storage = INSTANCE.get().ok_or("Settings not initialized".to_string())?;
    let value_raw = storage.get(key.to_string()).ok_or(format!("Key '{}' not found in store", key.to_string()))?;
    return serde_json::from_value(value_raw).map_err(|e| format!("{:?}", e));
}

pub fn set_item<T: serde::ser::Serialize>(key: SettingsKeys, value: T) -> Result<(), String> {
    let storage = INSTANCE.get().ok_or("Settings not initialized".to_string())?;
    let value_raw = serde_json::to_value(value).map_err(|e| format!("{:?}", e))?;
    storage.set(key.to_string(), value_raw);
    return Ok(());
}
