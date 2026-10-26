/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::OnceLock;

use anyhow::Error;
use tauri::Manager;
use tauri::path::BaseDirectory;

use crate::get_app_handle;

/* ========================================================================== */

#[derive(Debug, PartialEq, Eq, Hash)]
pub enum AppPaths {
    AppCache,
    AppConfig,
    AppData,
    AppLocalData,
    AppLog,

    UniChatAssets,
    UniChatGallery,
    UniChatSystemWidgets,
    UniChatUserWidgets,
    UniChatUserPlugins,
    UniChatLogoIcon,
    UniChatLicense
}

/* ========================================================================== */

static INSTANCE: OnceLock<HashMap<AppPaths, PathBuf>> = OnceLock::new();

pub fn init() -> Result<(), Error> {
    let app_handle = get_app_handle();
    let path = app_handle.path();

    let mut paths = HashMap::new();
    paths.insert(AppPaths::AppCache, path.app_cache_dir()?);
    paths.insert(AppPaths::AppConfig, path.app_config_dir()?);
    paths.insert(AppPaths::AppData, path.app_data_dir()?);
    paths.insert(AppPaths::AppLocalData, path.app_local_data_dir()?);
    paths.insert(AppPaths::AppLog, path.app_log_dir()?);
    paths.insert(AppPaths::UniChatAssets, path.resolve("assets", BaseDirectory::Resource)?);
    paths.insert(AppPaths::UniChatGallery, path.resolve("gallery", BaseDirectory::AppData)?);
    paths.insert(AppPaths::UniChatSystemWidgets, path.resolve("widgets", BaseDirectory::Resource)?);
    paths.insert(AppPaths::UniChatUserWidgets, path.resolve("widgets", BaseDirectory::AppData)?);
    paths.insert(AppPaths::UniChatUserPlugins, path.resolve("plugins", BaseDirectory::AppData)?);
    paths.insert(AppPaths::UniChatLogoIcon, path.resolve("icons/icon.png", BaseDirectory::Resource)?);
    paths.insert(AppPaths::UniChatLicense, path.resolve("LICENSE", BaseDirectory::Resource)?);

    INSTANCE.set(paths).expect("Paths::INSTANCE was already initialized");

    return Ok(());
}

pub fn get(key: AppPaths) -> PathBuf {
    let paths = INSTANCE.get().expect("Paths::INSTANCE was not initialized");
    return paths.get(&key).expect("Paths::INSTANCE missing key").clone();
}
