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
const STORE_VERSION_KEY: &str = "store:version";
const SETTINGS_TOUR_CURRENT_STEPS_KEY: &str = "settings.tour-steps";
const SETTINGS_TOUR_PREV_STEPS_KEY: &str = "settings.prev-tour-steps";
const SETTINGS_LOG_TWITCH_EVENTS_KEY: &str = "settings.log-twitch-events";
const SETTINGS_LOG_YOUTUBE_EVENTS_KEY: &str = "settings.log-youtube-events";
const SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY: &str = "settings.create-webview-hidden";

fn store_mount_scrapper_key(scrapper_id: &str, key: &str) -> String {
    return SCRAPPER_KEY_TEMPLATE.replacen("{}", scrapper_id, 1).replacen("{}", key, 1);
}

/* ================================================================================================================== */


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

fn migrate_store_version() -> Result<(), Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let mut current_version = get_store_version().unwrap_or_default();
    let target_version: u8 = 1;

    while current_version < target_version {
        match current_version {
            0 => {
                let twitch_channel_name = store.get("twitch-channel-name");
                if let Some(value) = twitch_channel_name {
                    log::info!("Migrating Twitch channel name to scrapper URL format");
                    let key = store_mount_scrapper_key("twitch-chat", "url");
                    let channel_name_str: String = serde_json::from_value(value)?;
                    let value_str = format!("https://www.twitch.tv/popout/{}/chat", channel_name_str);
                    let value_raw = serde_json::to_value(value_str)?;
                    store.set(key, value_raw);
                    store.delete("twitch-channel-name");
                }

                let youtube_video_id = store.get("youtube-video-id");
                if let Some(value) = youtube_video_id {
                    log::info!("Migrating YouTube video ID to scrapper URL format");
                    let key = store_mount_scrapper_key("youtube-chat", "url");
                    let video_id_str: String = serde_json::from_value(value)?;
                    let value_str = format!("https://www.youtube.com/live_chat?v={}", video_id_str);
                    let value_raw = serde_json::to_value(value_str)?;
                    store.set(key, value_raw);
                    store.delete("youtube-video-id");
                }

                /* ============================================================================== */

                let create_webview_hidden = store.get(SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY);
                if create_webview_hidden.is_none() {
                    log::info!("Setting default value for {} setting", SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY);
                    let raw_value = serde_json::to_value(true)?;
                    store.set(SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY, raw_value);
                }

                /* ============================================================================== */

                let mut twitch_log_level_need_migration = true;
                let twitch_log_level = store.get(SETTINGS_LOG_TWITCH_EVENTS_KEY);
                if let Some(value) = twitch_log_level {
                    if let Ok(_) = serde_json::from_value::<SettingLogEventLevel>(value) {
                        twitch_log_level_need_migration = false;
                    }
                }

                if twitch_log_level_need_migration {
                    log::info!("Setting default value for {} setting", SETTINGS_LOG_TWITCH_EVENTS_KEY);
                    let raw_value = serde_json::to_value(SettingLogEventLevel::OnlyErrors)?;
                    store.set(SETTINGS_LOG_TWITCH_EVENTS_KEY, raw_value);
                }

                /* ============================================================================== */

                let mut youtube_log_level_need_migration = true;
                let youtube_log_level = store.get(SETTINGS_LOG_YOUTUBE_EVENTS_KEY);
                if let Some(value) = youtube_log_level {
                    if let Ok(_) = serde_json::from_value::<SettingLogEventLevel>(value) {
                        youtube_log_level_need_migration = false;
                    }
                }

                if youtube_log_level_need_migration {
                    log::info!("Setting default value for {} setting", SETTINGS_LOG_YOUTUBE_EVENTS_KEY);
                    let raw_value = serde_json::to_value(SettingLogEventLevel::OnlyErrors)?;
                    store.set(SETTINGS_LOG_YOUTUBE_EVENTS_KEY, raw_value);
                }

                /* ============================================================================== */

                if store.get(SETTINGS_TOUR_CURRENT_STEPS_KEY).is_none() {
                    log::info!("Setting default value for {} setting", SETTINGS_TOUR_CURRENT_STEPS_KEY);
                    let raw_value = serde_json::to_value(Vec::<String>::new())?;
                    store.set(SETTINGS_TOUR_CURRENT_STEPS_KEY, raw_value);
                }

                if store.get(SETTINGS_TOUR_PREV_STEPS_KEY).is_none() {
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

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    let store_path = properties::get_app_path(AppPaths::AppConfig).join("settings.json");

    let store = app.store(store_path)?;
    INSTANCE.set(store).map_err(|_| Error::OnceLockAlreadyInitialized(ONCE_LOCK_NAME))?;

    migrate_store_version()?;

    return Ok(());
}

/* ====================================================================== */

pub fn get_store_item_raw(key: &str) -> Result<serde_json::Value, Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    return Ok(store.get(key).unwrap_or(serde_json::Value::Null));
}

/* ====================================================================== */

pub fn get_scrapper_url(scrapper_id: &str) -> Result<String, Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let key = store_mount_scrapper_key(scrapper_id, "url");
    let raw_value = store.get(key);

    if let Some(value) = raw_value {
        let url: String = serde_json::from_value(value)?;
        return Ok(url);
    } else {
        return Err(format!("Scrapper URL for ID '{}' not found", scrapper_id).into());
    }
}

pub fn set_scrapper_url(scrapper_id: &str, url: &str) -> Result<(), Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let key = store_mount_scrapper_key(scrapper_id, "url");
    let raw_value = serde_json::to_value(url)?;
    store.set(key, raw_value);

    return Ok(());
}

/* ====================================================================== */

pub fn get_tour_current_steps() -> Result<Vec<String>, Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = store.get(SETTINGS_TOUR_CURRENT_STEPS_KEY);

    if let Some(value) = raw_value {
        let steps: Vec<String> = serde_json::from_value(value)?;
        return Ok(steps);
    } else {
        return Ok(Vec::new());
    }
}

pub fn set_tour_current_steps(steps: Vec<String>) -> Result<(), Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = serde_json::to_value(steps)?;
    store.set(SETTINGS_TOUR_CURRENT_STEPS_KEY, raw_value);

    return Ok(());
}

pub fn get_tour_prev_steps() -> Result<Vec<String>, Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = store.get(SETTINGS_TOUR_PREV_STEPS_KEY);

    if let Some(value) = raw_value {
        let steps: Vec<String> = serde_json::from_value(value)?;
        return Ok(steps);
    } else {
        return Ok(Vec::new());
    }
}

pub fn set_tour_prev_steps(steps: Vec<String>) -> Result<(), Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = serde_json::to_value(steps)?;
    store.set(SETTINGS_TOUR_PREV_STEPS_KEY, raw_value);

    return Ok(());
}

/* ====================================================================== */

pub fn get_settings_create_webview_hidden() -> Result<bool, Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = store.get(SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY);

    if let Some(value) = raw_value {
        let flag: bool = serde_json::from_value(value)?;
        return Ok(flag);
    } else {
        return Ok(false);
    }
}

pub fn set_settings_create_webview_hidden(flag: bool) -> Result<(), Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = serde_json::to_value(flag)?;
    store.set(SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY, raw_value);

    return Ok(());
}

pub fn get_settings_log_twitch_events() -> Result<SettingLogEventLevel, Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = store.get(SETTINGS_LOG_TWITCH_EVENTS_KEY);

    if let Some(value) = raw_value {
        let level: SettingLogEventLevel = serde_json::from_value(value)?;
        return Ok(level);
    } else {
        return Ok(SettingLogEventLevel::OnlyErrors);
    }
}

pub fn set_settings_log_twitch_events(level: SettingLogEventLevel) -> Result<(), Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = serde_json::to_value(level)?;
    store.set(SETTINGS_LOG_TWITCH_EVENTS_KEY, raw_value);

    return Ok(());
}

pub fn get_settings_log_youtube_events() -> Result<SettingLogEventLevel, Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = store.get(SETTINGS_LOG_YOUTUBE_EVENTS_KEY);

    if let Some(value) = raw_value {
        let level: SettingLogEventLevel = serde_json::from_value(value)?;
        return Ok(level);
    } else {
        return Ok(SettingLogEventLevel::OnlyErrors);
    }
}

pub fn set_settings_log_youtube_events(level: SettingLogEventLevel) -> Result<(), Error> {
    let store = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let raw_value = serde_json::to_value(level)?;
    store.set(SETTINGS_LOG_YOUTUBE_EVENTS_KEY, raw_value);

    return Ok(());
}
