/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::time::Duration;
use std::time::SystemTime;

use anyhow::Error;
use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::utils::properties;
use crate::utils::properties::AppPaths;

/* ========================================================================== */

pub fn get_or_fetch<T: Serialize + DeserializeOwned>(key: &str, max_age: Duration, fetch: impl FnOnce() -> Result<T, Error>) -> Result<T, Error> {
    let app_cache_dir = properties::get_app_path(AppPaths::AppCache);
    if !app_cache_dir.exists() {
        fs::create_dir_all(&app_cache_dir)?;
    }

    let cache_path = app_cache_dir.join(format!("cached_{}.json", key));
    if let Ok(metadata) = fs::metadata(&cache_path) {
        let modified_at = metadata.modified()?;
        let duration = SystemTime::now().duration_since(modified_at)?;

        if duration < max_age {
            log::info!("Using cached '{}' file (age: {} seconds)", key, duration.as_secs());
            let data = fs::read_to_string(&cache_path)?;
            return serde_json::from_str(&data).map_err(|e| e.into());
        }
    }

    let value = fetch()?;
    let serialized = serde_json::to_string(&value)?;
    fs::write(&cache_path, &serialized)?;

    return Ok(value);
}
