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
use std::sync::OnceLock;

use anyhow::Error;
use anyhow::anyhow;
use serde::Deserialize;
use serde::Serialize;
use serde::de::DeserializeOwned;
use serde_json::Value;
use serde_json::json;
use tauri_plugin_store::Store;
use tauri_plugin_store::StoreExt;

use crate::get_app_handle;
use crate::utils::is_dev;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

mod listener;
mod migrations;

/* ========================================================================== */

pub use listener::add_change_listener;

/* ========================================================================== */

#[derive(Serialize, Deserialize, Debug, Eq, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SettingLogEventLevel {
    OnlyErrors,
    UnknownEvents,
    AllEvents
}

/* ========================================================================== */

const STORE_VERSION_KEY: &str = "store:version";
const SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY: &str = "settings:create-webview-hidden";
const SETTINGS_TOUR_CURRENT_STEPS_KEY: &str = "settings:current-tour-steps";
const SETTINGS_TOUR_PREVIOUS_STEPS_KEY: &str = "settings:previous-tour-steps";
const SETTINGS_DEFAULT_PREVIEW_WIDGET_KEY: &str = "settings:default-preview-widget";
const SETTINGS_OPEN_TO_LAN_KEY: &str = "settings:open-to-lan";
const SETTINGS_LOG_SCRAPER_EVENTS: &str = "settings:log-scraper-events";
const SETTINGS_OPEN_SCRAPER_WEBVIEW_KEY: &str = "settings:open-scraper-webview";
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

pub fn init() -> Result<(), Error> {
    let app_handle = get_app_handle();

    let store_path = properties::get_app_path(AppPaths::AppConfig).join("settings.json");

    let store = app_handle.store(store_path)?;
    set_instance(store);

    migrations::migrate()?;

    return Ok(());
}

/* ========================================================================== */

fn get_value<R: DeserializeOwned>(key: &str) -> Option<R> {
    let store = get_instance();
    let raw_value = store.get(key)?;
    return serde_json::from_value(raw_value).ok();
}

fn set_value<V: Serialize>(key: &str, value: V) {
    let store = get_instance();
    let raw_value = json!(value);
    store.set(key, raw_value.clone());

    listener::notify_change_listeners(key, &raw_value);
}

/* ========================================================================== */

pub fn get_create_webview_hidden() -> bool {
    return get_value(SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY).unwrap_or(true);
}

pub fn set_create_webview_hidden(value: bool) {
    set_value(SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY, value);
}

pub fn get_current_tour_steps() -> Vec<String> {
    return get_value(SETTINGS_TOUR_CURRENT_STEPS_KEY).unwrap_or_default();
}

pub fn set_current_tour_steps(value: &[String]) {
    set_value(SETTINGS_TOUR_CURRENT_STEPS_KEY, value);
}

pub fn get_previous_tour_steps() -> Vec<String> {
    return get_value(SETTINGS_TOUR_PREVIOUS_STEPS_KEY).unwrap_or_default();
}

pub fn set_previous_tour_steps(value: &[String]) {
    set_value(SETTINGS_TOUR_PREVIOUS_STEPS_KEY, value);
}

pub fn get_default_preview_widget() -> String {
    return get_value(SETTINGS_DEFAULT_PREVIEW_WIDGET_KEY).unwrap_or_else(|| String::from("default"));
}

pub fn set_default_preview_widget(value: &str) {
    set_value(SETTINGS_DEFAULT_PREVIEW_WIDGET_KEY, value);
}

pub fn get_open_to_lan() -> bool {
    return get_value(SETTINGS_OPEN_TO_LAN_KEY).unwrap_or(false);
}

pub fn set_open_to_lan(value: bool) {
    set_value(SETTINGS_OPEN_TO_LAN_KEY, value);
}

pub fn get_log_scraper_events() -> SettingLogEventLevel {
    return get_value(SETTINGS_LOG_SCRAPER_EVENTS).unwrap_or(SettingLogEventLevel::OnlyErrors);
}

pub fn set_log_scraper_events(value: SettingLogEventLevel) {
    set_value(SETTINGS_LOG_SCRAPER_EVENTS, value);
}

pub fn get_open_scraper_webview() -> bool {
    return get_value(SETTINGS_OPEN_SCRAPER_WEBVIEW_KEY).unwrap_or(false);
}

pub fn set_open_scraper_webview(value: bool) {
    set_value(SETTINGS_OPEN_SCRAPER_WEBVIEW_KEY, value);
}

pub fn get_currency_target() -> String {
    return get_value(SETTINGS_CURRENCY_TARGET_KEY).unwrap_or_default();
}

pub fn set_currency_target(value: &str) {
    set_value(SETTINGS_CURRENCY_TARGET_KEY, value);
}

pub fn get_scraper_events_log_level() -> SettingLogEventLevel {
    if is_dev() {
        return SettingLogEventLevel::AllEvents;
    }

    return get_log_scraper_events();
}

/* ========================================================================== */

pub fn get_scraper_url(scraper_id: &str) -> Option<String> {
    let key = store_mount_scraper_key(scraper_id, "url");
    return get_value(&key);
}

pub fn set_scraper_url(scraper_id: &str, url: &str) {
    let key = store_mount_scraper_key(scraper_id, "url");
    set_value(&key, url);
}

/* ========================================================================== */

pub fn get_by_key(key: &str) -> Result<Value, Error> {
    return match key {
        SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY => Ok(json!(get_create_webview_hidden())),
        SETTINGS_TOUR_CURRENT_STEPS_KEY => Ok(json!(get_current_tour_steps())),
        SETTINGS_TOUR_PREVIOUS_STEPS_KEY => Ok(json!(get_previous_tour_steps())),
        SETTINGS_DEFAULT_PREVIEW_WIDGET_KEY => Ok(json!(get_default_preview_widget())),
        SETTINGS_OPEN_TO_LAN_KEY => Ok(json!(get_open_to_lan())),
        SETTINGS_LOG_SCRAPER_EVENTS => Ok(json!(get_log_scraper_events())),
        SETTINGS_OPEN_SCRAPER_WEBVIEW_KEY => Ok(json!(get_open_scraper_webview())),
        SETTINGS_CURRENCY_TARGET_KEY => Ok(json!(get_currency_target())),
        _ => Err(anyhow!("Unknown setting '{}'", key))
    };
}

pub fn set_by_key(key: &str, value: &Value) -> Result<(), Error> {
    match key {
        SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY => {
            let value: bool = Deserialize::deserialize(value)?;
            set_create_webview_hidden(value);
        }
        SETTINGS_TOUR_CURRENT_STEPS_KEY => {
            let value: Vec<String> = Deserialize::deserialize(value)?;
            set_current_tour_steps(&value);
        }
        SETTINGS_TOUR_PREVIOUS_STEPS_KEY => {
            let value: Vec<String> = Deserialize::deserialize(value)?;
            set_previous_tour_steps(&value);
        }
        SETTINGS_DEFAULT_PREVIEW_WIDGET_KEY => {
            let value: String = Deserialize::deserialize(value)?;
            set_default_preview_widget(&value);
        }
        SETTINGS_OPEN_TO_LAN_KEY => {
            let value: bool = Deserialize::deserialize(value)?;
            set_open_to_lan(value);
        }
        SETTINGS_LOG_SCRAPER_EVENTS => {
            let value: SettingLogEventLevel = Deserialize::deserialize(value)?;
            set_log_scraper_events(value);
        }
        SETTINGS_OPEN_SCRAPER_WEBVIEW_KEY => {
            let value: bool = Deserialize::deserialize(value)?;
            set_open_scraper_webview(value);
        }
        SETTINGS_CURRENCY_TARGET_KEY => {
            let value: String = Deserialize::deserialize(value)?;
            set_currency_target(&value);
        }
        _ => {
            return Err(anyhow!("Unknown setting '{}'", key));
        }
    }

    return Ok(());
}
