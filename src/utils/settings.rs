use std::collections::HashMap;
use std::sync::Arc;
use std::sync::OnceLock;

use serde_json::Value;
use tauri_plugin_store::Store;
use tauri_plugin_store::StoreBuilder;

use crate::utils::properties;
use crate::utils::properties::AppPaths;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum SettingsKeys {
    YouTubeChatUrl,
    YouTubeChannelId,
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
        }
    };
}

settings_keys! {
    YouTubeChatUrl => "youtube-chat-url",
    YouTubeChannelId => "youtube-channel-id",
    TwitchChannelName => "twitch-channel-name",

    LogYoutubeEvents => "log-youtube-events",
}

static INSTANCE: OnceLock<Arc<Store<tauri::Wry>>> = OnceLock::new();
pub fn init(app: &mut tauri::App<tauri::Wry>) {
    let mut defaults = HashMap::new();
    defaults.insert(SettingsKeys::YouTubeChatUrl.to_string(), Value::from("about:blank"));
    defaults.insert(SettingsKeys::YouTubeChannelId.to_string(), Value::Null);
    defaults.insert(SettingsKeys::TwitchChannelName.to_string(), Value::from("about:blank"));

    defaults.insert(SettingsKeys::LogYoutubeEvents.to_string(), Value::from("ONLY_ERRORS"));

    let store_path = properties::get_app_path(AppPaths::AppConfigDir).join("unichat.db");
    INSTANCE.get_or_init(|| StoreBuilder::new(app, store_path).defaults(defaults).build().unwrap());
}

pub fn get_item(key: SettingsKeys) -> Result<Value, String> {
    let storage = INSTANCE.get().ok_or("Settings not initialized".to_string())?;
    return storage.get(key.as_str()).ok_or(format!("Key '{}' not found in store", key.as_str()));
}

pub fn set_item(key: SettingsKeys, value: Value) -> Result<(), String> {
    let storage = INSTANCE.get().ok_or("Settings not initialized".to_string())?;
    return Ok(storage.set(key.as_str(), value));
}
