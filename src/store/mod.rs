use std::collections::HashMap;
use std::sync::Arc;

use serde_json::Value;
use tauri::AppHandle;
use tauri::Manager;
use tauri_plugin_store::Store;
use tauri_plugin_store::StoreBuilder;

use crate::utils::constants;

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
    defaults.insert(String::from(constants::YOUTUBE_CHAT_URL_KEY), Value::from("about:blank"));
    defaults.insert(String::from(constants::YOUTUBE_CHANNEL_ID_KEY), Value::Null);
    defaults.insert(String::from(constants::TWITCH_CHANNEL_NAME_KEY), Value::from("about:blank"));

    let store_path = app.path().app_config_dir().unwrap().join("unichat.db");
    let store = StoreBuilder::new(app.handle(), store_path).defaults(defaults).build().unwrap();

    return store;
}
