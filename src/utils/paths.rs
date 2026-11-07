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
pub fn get(key: AppPaths) -> PathBuf {
    let paths = INSTANCE.get().expect("Paths::INSTANCE was not initialized");
    let path = paths.get(&key).expect("Paths::INSTANCE missing key");
    return path.clone();
}

/* ========================================================================== */

pub fn init() -> Result<(), Error> {
    let app_handle = get_app_handle();
    let path = app_handle.path();

    let app_cache = path.app_cache_dir()?;
    let app_config = path.app_config_dir()?;
    let app_data = path.app_data_dir()?;
    let app_local_data = path.app_local_data_dir()?;
    let app_log = path.app_log_dir()?;
    let assets = path.resolve("assets", BaseDirectory::Resource)?;
    let gallery = path.resolve("gallery", BaseDirectory::AppData)?;
    let system_widgets = path.resolve("widgets", BaseDirectory::Resource)?;
    let user_widgets = path.resolve("widgets", BaseDirectory::AppData)?;
    let user_plugins = path.resolve("plugins", BaseDirectory::AppData)?;
    let logo_icon = path.resolve("icons/icon.png", BaseDirectory::Resource)?;
    let license = path.resolve("LICENSE", BaseDirectory::Resource)?;

    let mut paths = HashMap::new();
    paths.insert(AppPaths::AppCache, app_cache);
    paths.insert(AppPaths::AppConfig, app_config);
    paths.insert(AppPaths::AppData, app_data);
    paths.insert(AppPaths::AppLocalData, app_local_data);
    paths.insert(AppPaths::AppLog, app_log);
    paths.insert(AppPaths::UniChatAssets, assets);
    paths.insert(AppPaths::UniChatGallery, gallery);
    paths.insert(AppPaths::UniChatSystemWidgets, system_widgets);
    paths.insert(AppPaths::UniChatUserWidgets, user_widgets);
    paths.insert(AppPaths::UniChatUserPlugins, user_plugins);
    paths.insert(AppPaths::UniChatLogoIcon, logo_icon);
    paths.insert(AppPaths::UniChatLicense, license);
    INSTANCE.set(paths).expect("Paths::INSTANCE was already initialized");

    return Ok(());
}
