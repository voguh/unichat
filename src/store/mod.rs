use std::collections::HashMap;
use std::sync::Arc;

use serde_json::Value;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::{Store, StoreBuilder};

pub static YOUTUBE_CHAT_URL_KEY: &str = "youtube-chat-url";
pub static YOUTUBE_CHANNEL_ID_KEY: &str = "youtube-channel-id";
pub static TWITCH_CHANNEL_NAME_KEY: &str = "twitch-channel-name";

pub fn get_item<R: tauri::Runtime>(app: &AppHandle<R>, key: &str) -> Result<Value, String> {
    let store = app.state::<Arc<Store<R>>>();
    return store.get(key).ok_or(format!("Key '{}' not found in store", key));
}

pub fn set_item<R: tauri::Runtime>(app: &AppHandle<R>, key: &str, value: Value) -> Result<(), String> {
    let store = app.state::<Arc<Store<R>>>();
    return Ok(store.set(key, value));
}

pub fn new<R: tauri::Runtime>(app: &mut tauri::App<R>) -> Arc<Store<R>> {
    let mut defaults = HashMap::new();
    defaults.insert(String::from(YOUTUBE_CHAT_URL_KEY), Value::from("about:blank"));
    defaults.insert(String::from(YOUTUBE_CHANNEL_ID_KEY), Value::Null);
    defaults.insert(String::from(TWITCH_CHANNEL_NAME_KEY), Value::from("about:blank"));

    let store_path = app.path().app_data_dir().unwrap().join("unichat.db");
    let store = StoreBuilder::new(app.handle(), store_path).defaults(defaults).build().unwrap();

    return store;
}
