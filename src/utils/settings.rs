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
pub enum YouTubeSettingLogLevel {
    OnlyErrors,
    UnknownEvents,
    AllEvents
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum SettingsKeys {
    YouTubeChatUrl,
    TwitchChannelName,

    LogYoutubeEvents,
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

            pub fn list_all_with_prefix(prefix: &str) -> Vec<SettingsKeys> {
                let keys = vec![$(SettingsKeys::$variant),*];

                return keys.into_iter().filter(|key| key.as_str().starts_with(prefix)).collect();
            }
        }
    };
}

settings_keys! {
    YouTubeChatUrl => "youtube-chat-url",
    TwitchChannelName => "twitch-channel-name",

    LogYoutubeEvents => "settings.log-youtube-events",
}

static INSTANCE: OnceLock<Arc<Store<tauri::Wry>>> = OnceLock::new();

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    let mut defaults = HashMap::new();
    defaults.insert(SettingsKeys::YouTubeChatUrl.to_string(), Value::from("about:blank"));
    defaults.insert(SettingsKeys::TwitchChannelName.to_string(), Value::from(""));

    defaults.insert(SettingsKeys::LogYoutubeEvents.to_string(), serde_json::to_value(YouTubeSettingLogLevel::OnlyErrors).unwrap());

    let store_path = properties::get_app_path(AppPaths::AppConfigDir).join("settings.json");

    let result = INSTANCE.set(StoreBuilder::new(app, store_path).defaults(defaults).build().unwrap());
    if result.is_err() {
        return Err("Failed to initialize settings store".into());
    }

    return Ok(());
}

pub fn get_item(key: SettingsKeys) -> Result<Value, String> {
    let storage = INSTANCE.get().ok_or("Settings not initialized".to_string())?;
    return storage.get(key.as_str()).ok_or(format!("Key '{}' not found in store", key.as_str()));
}

pub fn set_item(key: SettingsKeys, value: Value) -> Result<(), String> {
    let storage = INSTANCE.get().ok_or("Settings not initialized".to_string())?;
    return Ok(storage.set(key.as_str(), value));
}
