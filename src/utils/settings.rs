/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::sync::Arc;
use std::sync::OnceLock;

use serde::Deserialize;
use serde::Serialize;
use tauri_plugin_store::Store;
use tauri_plugin_store::StoreExt;

use crate::error::Error;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

#[derive(Serialize, Deserialize, Debug, Eq, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SettingLogEventLevel {
    OnlyErrors,
    UnknownEvents,
    AllEvents
}

const ONCE_LOCK_NAME: &str = "Settings::INSTANCE";
static INSTANCE: OnceLock<Arc<Store<tauri::Wry>>> = OnceLock::new();

const SCRAPPER_KEY_TEMPLATE: &str = "scrapper:{}:{}";
pub const STORE_VERSION_KEY: &str = "store:version";
pub const SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY: &str = "settings:create-webview-hidden";
pub const SETTINGS_TOUR_CURRENT_STEPS_KEY: &str = "settings:tour-steps";
pub const SETTINGS_TOUR_PREV_STEPS_KEY: &str = "settings:prev-tour-steps";

fn store_mount_scrapper_key(scrapper_id: &str, key: &str) -> String {
    return SCRAPPER_KEY_TEMPLATE.replacen("{}", scrapper_id, 1).replacen("{}", key, 1);
}

/* ================================================================================================================== */

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    let store_path = properties::get_app_path(AppPaths::AppConfig).join("settings.json");

    let store = app.store(store_path)?;
    INSTANCE.set(store).map_err(|_| Error::OnceLockAlreadyInitialized(ONCE_LOCK_NAME))?;

    migrate_store_version()?;

    return Ok(());
}

fn migrate_store_version() -> Result<(), Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let mut current_version = get_store_version().unwrap_or_default();
    let target_version: u8 = 1;

    while current_version < target_version {
        match current_version {
            0 => {
                let twitch_channel_name = store.get("twitch-channel-name");
                if let Some(value) = twitch_channel_name {
                    log::info!("Migrating Twitch channel name setting to scrapper property format");
                    let key = store_mount_scrapper_key("twitch-chat", "url");
                    let channel_name_str: String = serde_json::from_value(value)?;
                    let value_str = format!("https://www.twitch.tv/popout/{}/chat", channel_name_str);
                    let value_raw = serde_json::to_value(value_str)?;
                    store.set(key, value_raw);
                    store.delete("twitch-channel-name");
                }

                let youtube_video_id = store.get("youtube-video-id");
                if let Some(value) = youtube_video_id {
                    log::info!("Migrating YouTube video ID setting to scrapper property format");
                    let key = store_mount_scrapper_key("youtube-chat", "url");
                    let video_id_str: String = serde_json::from_value(value)?;
                    let value_str = format!("https://www.youtube.com/live_chat?v={}", video_id_str);
                    let value_raw = serde_json::to_value(value_str)?;
                    store.set(key, value_raw);
                    store.delete("youtube-video-id");
                }

                /* ============================================================================== */

                let twitch_log_level = store.get("settings.log-twitch-events");
                if let Some(value) = twitch_log_level {
                    log::info!("Migrating Twitch log level setting to scrapper property format");
                    let key = store_mount_scrapper_key("twitch-chat", "log_level");
                    store.set(key, value);
                    store.delete("settings.log-twitch-events");
                } else {
                    log::info!("Setting default log level for Twitch scrapper");
                    let key = store_mount_scrapper_key("twitch-chat", "log_level");
                    let raw_value = serde_json::to_value(SettingLogEventLevel::OnlyErrors)?;
                    store.set(key, raw_value);
                }

                let youtube_log_level = store.get("settings.log-youtube-events");
                if let Some(value) = youtube_log_level {
                    log::info!("Migrating YouTube log level setting to scrapper property format");
                    let key = store_mount_scrapper_key("youtube-chat", "log_level");
                    store.set(key, value);
                    store.delete("settings.log-youtube-events");
                } else {
                    log::info!("Setting default log level for YouTube scrapper");
                    let key = store_mount_scrapper_key("youtube-chat", "log_level");
                    let raw_value = serde_json::to_value(SettingLogEventLevel::OnlyErrors)?;
                    store.set(key, raw_value);
                }

                /* ============================================================================== */

                if let Some(value) = store.get("settings.create-webview-hidden") {
                    log::info!("Migrating legacy 'settings.create-webview-hidden' to new key '{}'", SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY);
                    store.set(SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY, value);
                    store.delete("settings.create-webview-hidden");
                } else {
                    log::info!("Setting default value for {} setting", SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY);
                    let raw_value = serde_json::to_value(true)?;
                    store.set(SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY, raw_value);
                }

                /* ============================================================================== */

                if let Some(value) = store.get("settings.tour-steps") {
                    log::info!("Migrating legacy 'settings.tour-steps' to new key '{}'", SETTINGS_TOUR_CURRENT_STEPS_KEY);
                    store.set(SETTINGS_TOUR_CURRENT_STEPS_KEY, value);
                    store.delete("settings.tour-steps");
                } else {
                    log::info!("Setting default value for {} setting", SETTINGS_TOUR_CURRENT_STEPS_KEY);
                    let raw_value = serde_json::to_value(Vec::<String>::new())?;
                    store.set(SETTINGS_TOUR_CURRENT_STEPS_KEY, raw_value);
                }

                if let Some(value) = store.get("settings.prev-tour-steps") {
                    log::info!("Migrating legacy 'settings.prev-tour-steps' to new key '{}'", SETTINGS_TOUR_PREV_STEPS_KEY);
                    store.set(SETTINGS_TOUR_PREV_STEPS_KEY, value);
                    store.delete("settings.prev-tour-steps");
                } else {
                    log::info!("Setting default value for {} setting", SETTINGS_TOUR_PREV_STEPS_KEY);
                    let raw_value = serde_json::to_value(Vec::<String>::new())?;
                    store.set(SETTINGS_TOUR_PREV_STEPS_KEY, raw_value);
                }

                /* ============================================================================== */

                let raw_value = serde_json::to_value(1)?;
                store.set(STORE_VERSION_KEY, raw_value);
                current_version = 1;
            }
            _ => {
                return Err(Error::from(format!("No migration path for version {}", current_version)));
            }
        }

    }

    return Ok(());
}

/* ====================================================================== */

pub fn get_store_version() -> Result<u8, Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = store.get(STORE_VERSION_KEY);
    if let Some(value) = raw_value {
        let version: u8 = serde_json::from_value(value)?;
        return Ok(version);
    } else {
        return Err("Store version not found".into());
    }
}

pub fn get_item<R: serde::de::DeserializeOwned>(key: &str) -> Result<R, Error> {
    if key.starts_with("scrapper") {
        return Err(Error::from("Use get_scrapper_property to get scrapper properties"));
    } else if key.starts_with("store") {
        return Err(Error::from("Keys starting with 'store' are reserved for internal use"));
    }

    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = store.get(key);
    if let Some(value) = raw_value {
        return serde_json::from_value(value).map_err(|e| Error::SerdeJson(e));
    } else {
        return Err(format!("Store item for key '{}' not found", key).into());
    }
}

pub fn set_item<V: serde::ser::Serialize>(key: &str, value: &V) -> Result<(), Error> {
    if key.starts_with("scrapper") {
        return Err(Error::from("Use set_scrapper_property to set scrapper properties"));
    } else if key.starts_with("store") {
        return Err(Error::from("Keys starting with 'store' are reserved for internal use"));
    }

    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = serde_json::to_value(value)?;
    store.set(key, raw_value);

    return Ok(());
}

/* ====================================================================== */

pub fn get_scrapper_property<R: serde::de::DeserializeOwned>(scrapper_id: &str, property: &str) -> Result<R, Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let key = store_mount_scrapper_key(scrapper_id, property);
    let raw_value = store.get(key);

    if let Some(value) = raw_value {
        return serde_json::from_value(value).map_err(|e| Error::SerdeJson(e));
    } else {
        return Err(format!("Scrapper property '{}' of '{}' scrapper not found", property, scrapper_id).into());
    }
}

pub fn set_scrapper_property<V: serde::ser::Serialize>(scrapper_id: &str, property: &str, value: &V) -> Result<(), Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let key = store_mount_scrapper_key(scrapper_id, property);
    let raw_value = serde_json::to_value(value)?;
    store.set(key, raw_value);

    return Ok(());
}
