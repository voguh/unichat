/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::OnceLock;
use std::sync::RwLock;
use std::sync::RwLockReadGuard;

use anyhow::anyhow;
use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;
use tauri_plugin_store::Store;
use tauri_plugin_store::StoreExt;

use crate::get_app_handle;
use crate::utils::is_dev;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

/* ========================================================================== */

#[derive(Serialize, Deserialize, Debug, Eq, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SettingLogEventLevel {
    OnlyErrors,
    UnknownEvents,
    AllEvents
}

/* ========================================================================== */

pub const STORE_VERSION_KEY: &str = "store:version";
pub const SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY: &str = "settings:create-webview-hidden";
pub const SETTINGS_TOUR_CURRENT_STEPS_KEY: &str = "settings:current-tour-steps";
pub const SETTINGS_TOUR_PREVIOUS_STEPS_KEY: &str = "settings:previous-tour-steps";
pub const SETTINGS_DEFAULT_PREVIEW_WIDGET_KEY: &str = "settings:default-preview-widget";
pub const SETTINGS_OPEN_TO_LAN_KEY: &str = "settings:open-to-lan";
pub const SETTINGS_LOG_SCRAPER_EVENTS: &str = "settings:log-scraper-events";
pub const SETTINGS_OPEN_SCRAPER_WEBVIEW_KEY: &str = "settings:open-scraper-webview";
pub const SETTINGS_CURRENCY_TARGET_KEY: &str = "settings:currency-target";

const SCRAPER_KEY_TEMPLATE: &str = "scraper:{}:{}";
fn store_mount_scraper_key(scraper_id: &str, key: &str) -> String {
    return SCRAPER_KEY_TEMPLATE.replacen("{}", scraper_id, 1).replacen("{}", key, 1);
}

/* ========================================================================== */

static INSTANCE: OnceLock<Arc<Store<tauri::Wry>>> = OnceLock::new();
fn get_instance() -> &'static Arc<Store<tauri::Wry>> {
    return INSTANCE.get().expect("Settings::INSTANCE was not initialized");
}

fn set_instance(store: Arc<Store<tauri::Wry>>) {
    if INSTANCE.set(store).is_err() {
        panic!("Settings::INSTANCE was already initialized");
    }
}

/* ========================================================================== */

type SettingsChangeListener = Box<dyn Fn(&str, &serde_json::Value) + Send + Sync>;

static LISTENERS: LazyLock<RwLock<Vec<(String, SettingsChangeListener)>>> = LazyLock::new(|| RwLock::new(Vec::new()));
fn read_listeners() -> RwLockReadGuard<'static, Vec<(String, SettingsChangeListener)>> {
    return LISTENERS.read().expect("Settings::LISTENERS lock poisoned");
}

fn write_listeners(key: String, listener: SettingsChangeListener) {
    let mut listeners = LISTENERS.write().expect("Settings::LISTENERS lock poisoned");
    listeners.push((key, listener));
}

/* ========================================================================== */

static MIGRATIONS: LazyLock<Vec<Box<dyn Fn(&Arc<Store<tauri::Wry>>) -> Result<(), Error> + Send + Sync>>> = LazyLock::new(|| {
    return vec![
        Box::new(|store| {
            let twitch_url_key = store_mount_scraper_key("twitch-chat", "url");
            if let Some(value) = store.get("twitch-channel-name") {
                log::info!("Migrating legacy 'twitch-channel-name' to new key '{}'", twitch_url_key);
                let channel_name_str: String = serde_json::from_value(value)?;
                let value_str = format!("https://www.twitch.tv/popout/{}/chat", channel_name_str);
                let value_raw = serde_json::json!(value_str);
                store.set(&twitch_url_key, value_raw);
                store.delete("twitch-channel-name");
            } else {
                log::info!("Setting default value for '{}' setting", twitch_url_key);
                let raw_value = serde_json::json!("");
                store.set(&twitch_url_key, raw_value);
            }

            let youtube_url_key = store_mount_scraper_key("youtube-chat", "url");
            if let Some(value) = store.get("youtube-video-id") {
                log::info!("Migrating legacy 'youtube-video-id' to new key '{}'", youtube_url_key);
                let video_id_str: String = serde_json::from_value(value)?;
                let value_str = format!("https://www.youtube.com/live_chat?v={}", video_id_str);
                let value_raw = serde_json::json!(value_str);
                store.set(&youtube_url_key, value_raw);
                store.delete("youtube-video-id");
            } else {
                log::info!("Setting default value for '{}' setting", youtube_url_key);
                let raw_value = serde_json::json!("");
                store.set(&youtube_url_key, raw_value);
            }

            /* ============================================================== */

            let twitch_log_level_key = store_mount_scraper_key("twitch-chat", "log_level");
            if let Some(value) = store.get("settings.log-twitch-events") {
                log::info!("Migrating legacy 'settings.log-twitch-events' to new key '{}'", twitch_log_level_key);
                store.set(&twitch_log_level_key, value);
                store.delete("settings.log-twitch-events");
            } else {
                log::info!("Setting default value for '{}' setting", twitch_log_level_key);
                let raw_value = serde_json::json!(SettingLogEventLevel::OnlyErrors);
                store.set(&twitch_log_level_key, raw_value);
            }

            let youtube_log_level_key = store_mount_scraper_key("youtube-chat", "log_level");
            if let Some(value) = store.get("settings.log-youtube-events") {
                log::info!("Migrating legacy 'settings.log-youtube-events' to new key '{}'", youtube_log_level_key);
                store.set(&youtube_log_level_key, value);
                store.delete("settings.log-youtube-events");
            } else {
                log::info!("Setting default value for '{}' setting", youtube_log_level_key);
                let raw_value = serde_json::json!(SettingLogEventLevel::OnlyErrors);
                store.set(&youtube_log_level_key, raw_value);
            }

            /* ============================================================== */

            let create_webview_hidden_key = "settings:create-webview-hidden";
            if let Some(value) = store.get("settings.create-webview-hidden") {
                log::info!("Migrating legacy 'settings.create-webview-hidden' to new key '{}'", create_webview_hidden_key);
                store.set(create_webview_hidden_key, value);
                store.delete("settings.create-webview-hidden");
            } else {
                log::info!("Setting default value for '{}' setting", create_webview_hidden_key);
                let raw_value = serde_json::json!(true);
                store.set(create_webview_hidden_key, raw_value);
            }

            /* ============================================================== */

            let current_tour_steps_key = "settings:tour-steps";
            if let Some(value) = store.get("settings.tour-steps") {
                log::info!("Migrating legacy 'settings.tour-steps' to new key '{}'", current_tour_steps_key);
                store.set(current_tour_steps_key, value);
                store.delete("settings.tour-steps");
            } else {
                log::info!("Setting default value for '{}' setting", current_tour_steps_key);
                let raw_value = serde_json::json!([]);
                store.set(current_tour_steps_key, raw_value);
            }

            let previous_tour_steps_key = "settings:prev-tour-steps";
            if let Some(value) = store.get("settings.prev-tour-steps") {
                log::info!("Migrating legacy 'settings.prev-tour-steps' to new key '{}'", previous_tour_steps_key);
                store.set(previous_tour_steps_key, value);
                store.delete("settings.prev-tour-steps");
            } else {
                log::info!("Setting default value for '{}' setting", previous_tour_steps_key);
                let raw_value = serde_json::json!([]);
                store.set(previous_tour_steps_key, raw_value);
            }

            /* ============================================================== */

            return Ok(());
        }),
        Box::new(|store| {
            let default_preview_widget_key = "settings:default-preview-widget";
            if store.get(default_preview_widget_key).is_none() {
                log::info!("Setting default value for '{}' setting", default_preview_widget_key);
                let raw_value = serde_json::json!("default");
                store.set(default_preview_widget_key, raw_value);
            }

            /* ============================================================== */

            let open_to_lan_key = "settings:open-to-lan";
            if store.get(open_to_lan_key).is_none() {
                log::info!("Setting default value for '{}' setting", open_to_lan_key);
                let raw_value = serde_json::json!(false);
                store.set(open_to_lan_key, raw_value);
            }

            /* ============================================================== */

            let log_scraper_events_key = "settings:log-scraper-events";
            if store.get(log_scraper_events_key).is_none() {
                log::info!("Setting default value for '{}' setting", log_scraper_events_key);
                let raw_value = serde_json::json!(SettingLogEventLevel::OnlyErrors);
                store.set(log_scraper_events_key, raw_value);
            }

            let twitch_log_level_key = store_mount_scraper_key("twitch-chat", "log_level");
            if store.get(&twitch_log_level_key).is_some() {
                log::info!("Removing deprecated key '{}'", twitch_log_level_key);
                store.delete(twitch_log_level_key);
            }

            let youtube_log_level_key = store_mount_scraper_key("youtube-chat", "log_level");
            if store.get(&youtube_log_level_key).is_some() {
                log::info!("Removing deprecated key '{}'", youtube_log_level_key);
                store.delete(youtube_log_level_key);
            }

            /* ============================================================== */

            let current_tour_steps_key = "settings:current-tour-steps";
            if let Some(value) = store.get("settings:tour-steps") {
                log::info!("Migrating deprecated 'settings:tour-steps' to '{}'", current_tour_steps_key);
                store.set(current_tour_steps_key, value);
                store.delete("settings:tour-steps");
            } else {
                log::info!("Setting default value for '{}' setting", current_tour_steps_key);
                let raw_value = serde_json::json!([]);
                store.set(current_tour_steps_key, raw_value);
            }

            let previous_tour_steps_key = "settings:previous-tour-steps";
            if let Some(value) = store.get("settings:prev-tour-steps") {
                log::info!("Migrating deprecated 'settings:prev-tour-steps' to '{}'", previous_tour_steps_key);
                store.set(previous_tour_steps_key, value);
                store.delete("settings:prev-tour-steps");
            } else {
                log::info!("Setting default value for '{}' setting", previous_tour_steps_key);
                let raw_value = serde_json::json!([]);
                store.set(previous_tour_steps_key, raw_value);
            }

            return Ok(());
        }),
        Box::new(|store| {
            let open_scraper_webview_key = "settings:open-scraper-webview";
            if store.get(open_scraper_webview_key).is_none() {
                log::info!("Setting default value for '{}' setting", open_scraper_webview_key);
                let raw_value = serde_json::json!(false);
                store.set(open_scraper_webview_key, raw_value);
            }

            return Ok(());
        }),
        Box::new(|store| {
            let currency_target_key = "settings:currency-target";
            if store.get(currency_target_key).is_none() {
                log::info!("Setting default value for '{}' setting", currency_target_key);
                let raw_value = serde_json::json!("");
                store.set(currency_target_key, raw_value);
            }

            return Ok(());
        })
    ]
});

/* ========================================================================== */

pub fn get_store_version() -> Result<u8, Error> {
    let store = get_instance();

    let raw_value = store.get(STORE_VERSION_KEY);
    if let Some(value) = raw_value {
        let version: u8 = serde_json::from_value(value)?;
        return Ok(version);
    } else {
        return Err(anyhow!("Store version not found"));
    }
}

fn migrate_store_version() -> Result<(), Error> {
    let store = get_instance();

    let mut current_version = get_store_version().unwrap_or(0);
    for (idx, migration) in MIGRATIONS.iter().enumerate() {
        let idx: u8 = idx.try_into()?;
        let version = idx + 1;

        if current_version < version {

            log::info!("Applying store migration for version {}", version);
            migration(store)?;
            log::info!("Store migrated to version {}", version);

            let raw_value = serde_json::json!(version);
            store.set(STORE_VERSION_KEY, raw_value);
            current_version = version;
        }
    }

    return Ok(());
}

pub fn init() -> Result<(), Error> {
    let app_handle = get_app_handle();

    let store_path = properties::get_app_path(AppPaths::AppConfig).join("settings.json");

    let store = app_handle.store(store_path)?;
    set_instance(store);

    migrate_store_version()?;

    return Ok(());
}

/* ========================================================================== */

pub fn add_change_listener<F: Fn(&str, &serde_json::Value) + Send + Sync + 'static>(key: &str, listener: F) {
    write_listeners(key.to_string(), Box::new(listener));
}

fn notify_change_listeners(key: &str, value: &serde_json::Value) {
    for (listener_key, listener) in read_listeners().iter() {
        if listener_key == key {
            listener(key, value);
        }
    }
}

/* ========================================================================== */

pub fn get_item<R: serde::de::DeserializeOwned>(key: &str) -> Result<R, Error> {
    let key = key.trim();
    if key.is_empty() {
        return Err(anyhow!("Store key cannot be empty"));
    } else if key.starts_with("scraper") {
        return Err(anyhow!("Use get_scraper_property to get scraper properties"));
    } else if key.starts_with("store") {
        return Err(anyhow!("Keys starting with 'store' are reserved for internal use"));
    }

    let store = get_instance();

    let raw_value = store.get(key);
    if let Some(value) = raw_value {
        let value = serde_json::from_value(value)?;
        return Ok(value);
    } else {
        return Err(anyhow!("Store item for key '{}' not found", key));
    }
}

pub fn set_item<V: serde::ser::Serialize>(key: &str, value: &V) -> Result<(), Error> {
    let key = key.trim();
    if key.is_empty() {
        return Err(anyhow!("Store key cannot be empty"));
    } else if key.starts_with("scraper") {
        return Err(anyhow!("Use set_scraper_property to set scraper properties"));
    } else if key.starts_with("store") {
        return Err(anyhow!("Keys starting with 'store' are reserved for internal use"));
    }

    let store = get_instance();

    let raw_value = serde_json::to_value(value)?;
    store.set(key, raw_value.clone());

    notify_change_listeners(key, &raw_value);

    return Ok(());
}

/* ========================================================================== */

pub fn get_scraper_property<R: serde::de::DeserializeOwned>(scraper_id: &str, property: &str) -> Result<R, Error> {
    let scraper_id = scraper_id.trim();
    if scraper_id.is_empty() {
        return Err(anyhow!("Scraper ID cannot be empty"));
    } else if !scraper_id.ends_with("-chat") {
        return Err(anyhow!("Invalid scraper ID '{}'", scraper_id));
    }

    let property = property.trim();
    if property.is_empty() {
        return Err(anyhow!("Scraper property cannot be empty"));
    }

    let store = get_instance();

    let key = store_mount_scraper_key(scraper_id, property);
    let raw_value = store.get(key);

    if let Some(value) = raw_value {
        let value = serde_json::from_value(value)?;
        return Ok(value);
    } else {
        return Err(anyhow!("Scraper property '{}' of '{}' scraper not found", property, scraper_id));
    }
}

pub fn set_scraper_property<V: serde::ser::Serialize>(scraper_id: &str, property: &str, value: &V) -> Result<(), Error> {
    let scraper_id = scraper_id.trim();
    if scraper_id.is_empty() {
        return Err(anyhow!("Scraper ID cannot be empty"));
    } else if !scraper_id.ends_with("-chat") {
        return Err(anyhow!("Invalid scraper ID '{}'", scraper_id));
    }

    let property = property.trim();
    if property.is_empty() {
        return Err(anyhow!("Scraper property cannot be empty"));
    }

    let store = get_instance();

    let key = store_mount_scraper_key(scraper_id, property);
    let raw_value = serde_json::to_value(value)?;
    store.set(key, raw_value);

    return Ok(());
}

pub fn get_scraper_events_log_level() -> SettingLogEventLevel {
    if is_dev() {
        return SettingLogEventLevel::AllEvents;
    }

    if let Ok(level) = get_item(SETTINGS_LOG_SCRAPER_EVENTS) {
        return level;
    } else {
        return SettingLogEventLevel::OnlyErrors;
    }
}
