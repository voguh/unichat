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

use anyhow::Error;
use tauri_plugin_store::Store;

use crate::settings::STORE_VERSION_KEY;
use crate::settings::SettingLogEventLevel;
use crate::settings::get_instance;
use crate::settings::store_mount_scraper_key;

/* ========================================================================== */

type Migration = Box<dyn Fn(&Arc<Store<tauri::Wry>>) -> Result<(), Error> + Send + Sync>;
static MIGRATIONS: LazyLock<Vec<Migration>> = LazyLock::new(|| {
    return vec![
        Box::new(|store| {
            let twitch_url_key = store_mount_scraper_key("twitch-chat", "url");
            if let Some(value) = store.get("twitch-channel-name") {
                log::info!("Migrating legacy 'twitch-channel-name' to key '{}'", twitch_url_key);
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
                log::info!("Migrating legacy 'youtube-video-id' to key '{}'", youtube_url_key);
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
                log::info!("Migrating legacy 'settings.log-twitch-events' to key '{}'", twitch_log_level_key);
                store.set(&twitch_log_level_key, value);
                store.delete("settings.log-twitch-events");
            } else {
                log::info!("Setting default value for '{}' setting", twitch_log_level_key);
                let raw_value = serde_json::json!(SettingLogEventLevel::OnlyErrors);
                store.set(&twitch_log_level_key, raw_value);
            }

            let youtube_log_level_key = store_mount_scraper_key("youtube-chat", "log_level");
            if let Some(value) = store.get("settings.log-youtube-events") {
                log::info!("Migrating legacy 'settings.log-youtube-events' to key '{}'", youtube_log_level_key);
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
                log::info!("Migrating legacy 'settings.create-webview-hidden' to key '{}'", create_webview_hidden_key);
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
                log::info!("Migrating legacy 'settings.tour-steps' to key '{}'", current_tour_steps_key);
                store.set(current_tour_steps_key, value);
                store.delete("settings.tour-steps");
            } else {
                log::info!("Setting default value for '{}' setting", current_tour_steps_key);
                let raw_value = serde_json::json!([]);
                store.set(current_tour_steps_key, raw_value);
            }

            let previous_tour_steps_key = "settings:prev-tour-steps";
            if let Some(value) = store.get("settings.prev-tour-steps") {
                log::info!("Migrating legacy 'settings.prev-tour-steps' to key '{}'", previous_tour_steps_key);
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
                log::info!("Migrating deprecated 'settings:tour-steps' to key '{}'", current_tour_steps_key);
                store.set(current_tour_steps_key, value);
                store.delete("settings:tour-steps");
            } else {
                log::info!("Setting default value for '{}' setting", current_tour_steps_key);
                let raw_value = serde_json::json!([]);
                store.set(current_tour_steps_key, raw_value);
            }

            let previous_tour_steps_key = "settings:previous-tour-steps";
            if let Some(value) = store.get("settings:prev-tour-steps") {
                log::info!("Migrating deprecated 'settings:prev-tour-steps' to key '{}'", previous_tour_steps_key);
                store.set(previous_tour_steps_key, value);
                store.delete("settings:prev-tour-steps");
            } else {
                log::info!("Setting default value for '{}' setting", previous_tour_steps_key);
                let raw_value = serde_json::json!([]);
                store.set(previous_tour_steps_key, raw_value);
            }

            /* ============================================================== */

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
        }),
    ];
});

/* ========================================================================== */

fn get_store_version() -> Result<u8, Error> {
    let store = get_instance();

    let raw_value = store.get(STORE_VERSION_KEY);
    if let Some(value) = raw_value {
        let version: u8 = serde_json::from_value(value)?;
        return Ok(version);
    } else {
        return Ok(0);
    }
}

pub(super) fn migrate() -> Result<(), Error> {
    let store = get_instance();

    if store.get(STORE_VERSION_KEY).is_none() {
        log::info!("Store version not found, clearing settings");
        store.clear();
    }

    let mut current_version = get_store_version()?;
    for (idx, migration) in MIGRATIONS.iter().enumerate() {
        let idx: u8 = idx.try_into().expect("More than 255 store migrations");
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
