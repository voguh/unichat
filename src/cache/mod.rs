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
use serde::Serialize;
use serde::de::DeserializeOwned;

use crate::utils::paths;
use crate::utils::paths::AppPaths;

/* ========================================================================== */

pub fn get_or_fetch<T: Serialize + DeserializeOwned>(
    key: &str,
    max_age: Duration,
    fetch: impl FnOnce() -> Result<T, Error>
) -> Result<T, Error> {
    let app_cache_dir = paths::get(AppPaths::AppCache);
    fs::create_dir_all(&app_cache_dir)?;

    let cache_path = app_cache_dir.join(format!("cached_{}.json", key));
    if let Ok(metadata) = fs::metadata(&cache_path) {
        let modified_at = metadata.modified()?;
        let duration = SystemTime::now().duration_since(modified_at)?;

        if duration < max_age {
            let data = fs::read(&cache_path)?;
            match serde_json::from_slice(&data) {
                Ok(value) => {
                    log::info!("Using cached '{}' file (age: {} seconds)", key, duration.as_secs());
                    return Ok(value);
                }
                Err(e) => {
                    log::warn!("Failed to parse cached '{}' file, fetching again: {:#?}", key, e);
                }
            }
        }
    }

    let value = fetch()?;
    let serialized = serde_json::to_string(&value)?;
    fs::write(&cache_path, &serialized)?;

    return Ok(value);
}
