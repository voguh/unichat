/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;
use std::path;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;
use std::time::Duration;

use anyhow::anyhow;
use anyhow::Error;
use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::mpsc::unbounded_channel;
use tokio::time::sleep;

use crate::events;
use crate::events::unichat::UniChatEvent;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

static USERSTORE_PATH: LazyLock<path::PathBuf> = LazyLock::new(|| properties::get_app_path(AppPaths::AppData).join("userstore.json"));

const USERSTORE_INSTANCE_NAME: &str = "UserStore::CACHE_INSTANCE";
static USERSTORE_CACHE: LazyLock<Arc<RwLock<HashMap<String, String>>>> = LazyLock::new(|| Arc::new(RwLock::new(HashMap::new())));

static USERSTORE_WRITE_TX: LazyLock<UnboundedSender<()>> = LazyLock::new(|| {
    let (tx, mut rx) = unbounded_channel();

    tauri::async_runtime::spawn(async move {
        let mut pending = false;

        while let Some(_) = rx.recv().await {
            if pending {
                continue;
            }

            pending = true;
            sleep(Duration::from_secs(5)).await;
            let _ = flush_userstore();
            pending = false;
        }
    });

    return tx;
});

/* ================================================================================================================== */

fn flush_userstore() -> Result<(), Error> {
    if let Ok(store) = USERSTORE_CACHE.read() {
        let store_path = USERSTORE_PATH.as_path();
        let raw_data = serde_json::to_string(&*store)?;
        fs::write(store_path, raw_data)?;
    }

    return Ok(());
}

/* ================================================================================================================== */

pub fn init(_app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    let store_path = USERSTORE_PATH.as_path();
    if !store_path.exists() {
        fs::write(store_path, "{}")?;
    }

    let raw_data = fs::read_to_string(store_path)?;
    let data: HashMap<String, String> = serde_json::from_str(&raw_data)?;
    let mut cache = USERSTORE_CACHE.write().map_err(|_| anyhow!("Failed to acquire UserStore cache write lock"))?;
    *cache = data;

    return Ok(());
}

/* ================================================================================================================== */

pub fn get_all_items() -> Result<HashMap<String, String>, Error> {
    let store = USERSTORE_CACHE.read().map_err(|_| anyhow!("{} cache lock poisoned", USERSTORE_INSTANCE_NAME))?;
    return Ok(store.clone());
}

pub fn get_item<R: serde::de::DeserializeOwned>(key: &str) -> Result<Option<R>, Error> {
    let key = key.trim();
    if key.is_empty() {
        return Err(anyhow!("Store key cannot be empty"));
    }

    let store = USERSTORE_CACHE.read().map_err(|_| anyhow!("{} cache lock poisoned", USERSTORE_INSTANCE_NAME))?;

    let raw_value = store.get(key);
    if let Some(raw_value) = raw_value {
        let value: R;
        if let Ok(plain) = serde_plain::from_str(raw_value) {
            value = plain;
        } else if let Ok(json) = serde_json::from_str(raw_value) {
            value = json;
        } else {
            return Err(anyhow!("Failed to deserialize UserStore item for key '{}'", key));
        }

        return Ok(Some(value));
    } else {
        return Ok(None);
    }
}

pub fn set_item<V: serde::ser::Serialize>(key: &str, value: &Option<V>) -> Result<(), Error> {
    let key = key.trim();
    if key.is_empty() {
        return Err(anyhow!("Store key cannot be empty"));
    }

    let mut store = USERSTORE_CACHE.write().map_err(|_| anyhow!("{} cache lock poisoned", USERSTORE_INSTANCE_NAME))?;

    if let Some(value) = value {
        let raw_value: String;
        if let Ok(plain) = serde_plain::to_string(value) {
            raw_value = plain;
        } else if let Ok(json) = serde_json::to_string(value) {
            raw_value = json;
        } else {
            return Err(anyhow!("Failed to serialize UserStore item for key '{}'", key));
        }

        store.insert(key.to_string(), raw_value.clone());

        let event = UniChatEvent::userstore_update(key.to_string(), Some(raw_value.clone()));
        if let Err(err) = events::emit(event) {
            log::error!("Failed to emit UserStoreUpdate event: {:#?}", err);
        }

        if let Err(err) = USERSTORE_WRITE_TX.send(()) {
            log::error!("Failed to schedule UserStore flush: {:#?}", err);
        }
    } else {
        store.remove(key);

        let event = UniChatEvent::userstore_update(key.to_string(), None);
        if let Err(err) = events::emit(event) {
            log::error!("Failed to emit UserStoreUpdate event: {:#?}", err);
        }

        if let Err(err) = USERSTORE_WRITE_TX.send(()) {
            log::error!("Failed to schedule UserStore flush: {:#?}", err);
        }
    }


    return Ok(());
}
