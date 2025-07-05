/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
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

pub enum SettingsKeys {
    YouTubeVideoId,
    TwitchChannelName,

    LogYouTubeEvents,
    LogTwitchEvents,
}

macro_rules! settings_keys {
    ($($variant:ident => $str:expr),* $(,)?) => {
        impl SettingsKeys {
            pub fn as_str(&self) -> &str {
                return match self {
                    $(SettingsKeys::$variant => $str),*
                };
            }

            pub fn from_str(key: &str) -> Result<Self, String> {
                return match key {
                    $($str => Ok(SettingsKeys::$variant)),*,
                    _ => Err(format!("Unknown storage key: '{}'", key)),
                }
            }

            pub fn to_string(&self) -> String {
                return String::from(self.as_str());
            }
        }
    };
}

settings_keys! {
    YouTubeVideoId => "youtube-video-id",
    TwitchChannelName => "twitch-channel-name",

    LogYouTubeEvents => "settings.log-youtube-events",
    LogTwitchEvents => "settings.log-twitch-events"
}

static INSTANCE: OnceLock<Arc<Store<tauri::Wry>>> = OnceLock::new();

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    let mut defaults = HashMap::new();
    defaults.insert(SettingsKeys::YouTubeVideoId.to_string(), Value::from(""));
    defaults.insert(SettingsKeys::TwitchChannelName.to_string(), Value::from(""));

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
    let value_raw = storage.get(key.as_str()).ok_or(format!("Key '{}' not found in store", key.as_str()))?;
    return serde_json::from_value(value_raw).map_err(|e| format!("{:?}", e));
}

pub fn set_item<T: serde::ser::Serialize>(key: SettingsKeys, value: T) -> Result<(), String> {
    let storage = INSTANCE.get().ok_or("Settings not initialized".to_string())?;
    let value_raw = serde_json::to_value(value).map_err(|e| format!("{:?}", e))?;
    storage.set(key.as_str(), value_raw);
    return Ok(());
}
