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
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;
use std::sync::RwLockReadGuard;

use anyhow::Error;
use anyhow::anyhow;
use mlua::Table;
use mlua::Value;

use crate::addons::MANIFEST_FILE;
use crate::addons::UniChatAddonManifest;
use crate::addons::is_valid_addon_dir;
use crate::addons::load_manifest;
use crate::utils::paths;
use crate::utils::paths::AppPaths;
use crate::utils::semver::Version;
use crate::utils::semver::VersionRange;

mod instance;
mod runtime;

/* ========================================================================== */

const PLUGIN_ASSETS_DIR: &str = "assets";
const PLUGIN_DATA_DIR: &str = "data";
const PLUGIN_ENTRYPOINT_FILE: &str = "main.lua";
const PLUGIN_ICON_FILE: &str = "icon.png";
pub const PLUGIN_WIDGETS_DIR: &str = "widgets";

/* ========================================================================== */

static LOADED: LazyLock<RwLock<HashMap<String, Arc<PluginMetadata>>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
fn read() -> RwLockReadGuard<'static, HashMap<String, Arc<PluginMetadata>>> {
    return LOADED.read().expect("Plugins::LOADED lock poisoned");
}

fn write(plugin: Arc<PluginMetadata>) -> Result<(), Error> {
    let mut loaded = LOADED.write().expect("Plugins::LOADED lock poisoned");
    if loaded.contains_key(&plugin.id) {
        return Err(anyhow!("Plugin with id '{}' is already loaded", plugin.id));
    }

    loaded.insert(plugin.id.clone(), plugin);

    return Ok(());
}

/* ========================================================================== */

pub fn runtime_initialized() -> bool {
    return runtime::initialized();
}

/* ========================================================================== */

pub fn get_plugins() -> Vec<Arc<PluginMetadata>> {
    let envs = read();
    return envs.values().cloned().collect();
}

fn get_plugin(plugin_id: &str) -> Arc<PluginMetadata> {
    let envs = read();
    let plugin = envs.get(plugin_id).expect("Plugin is registered before its Lua code runs");
    return plugin.clone();
}

/* ========================================================================== */

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "UPPERCASE")]
pub enum PluginStatus {
    Loaded,
    Invalid,
    Active,
    Error
}

/* ========================================================================== */

pub struct PluginMetadata {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub version: Version,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: HashMap<String, VersionRange>,

    status: RwLock<PluginStatus>,
    messages: RwLock<Vec<String>>,

    path: PathBuf,
    plugin_env: Table,
    loaded_modules_cache: RwLock<HashMap<String, Value>>
}

impl PluginMetadata {
    fn new(path: &Path, manifest: &UniChatAddonManifest) -> Result<Self, Error> {
        let folder_name = path.file_name().expect("Plugin path comes from a directory entry");

        let lua = runtime::get();
        let env = lua.create_table()?;

        return Ok(Self {
            id: folder_name.to_string_lossy().to_string(),
            name: manifest.name.clone(),
            description: manifest.description.clone(),
            version: manifest.version.clone(),
            author: manifest.author.clone(),
            license: manifest.license.clone(),
            homepage: manifest.homepage.clone(),
            dependencies: manifest.dependencies.clone(),

            status: RwLock::new(PluginStatus::Loaded),
            messages: RwLock::new(Vec::new()),

            path: path.to_path_buf(),
            plugin_env: env,
            loaded_modules_cache: RwLock::new(HashMap::new())
        });
    }

    /* ====================================================================== */

    pub fn get_status(&self) -> PluginStatus {
        let status = self.status.read().expect("Plugin status lock poisoned");
        return status.clone();
    }

    fn set_status(&self, status: PluginStatus) {
        let mut current_status = self.status.write().expect("Plugin status lock poisoned");
        *current_status = status;
    }

    /* ====================================================================== */

    pub fn get_messages(&self) -> Vec<String> {
        let messages = self.messages.read().expect("Plugin messages lock poisoned");
        return messages.clone();
    }

    pub fn add_message<S: Into<String>>(&self, message: S) {
        let message = message.into();
        let mut messages = self.messages.write().expect("Plugin messages lock poisoned");
        messages.push(message);
    }

    /* ====================================================================== */

    fn get_plugin_env(&self) -> Table {
        return self.plugin_env.clone();
    }

    /* ====================================================================== */

    fn get_cached_loaded_module(&self, module_name: &str) -> Option<Value> {
        let cache = self.loaded_modules_cache.read().expect("Loaded modules cache lock poisoned");
        return cache.get(module_name).cloned();
    }

    fn set_cached_loaded_module(&self, module_name: &str, module: Value) -> Value {
        let mut cache = self.loaded_modules_cache.write().expect("Loaded modules cache lock poisoned");
        cache.insert(module_name.to_string(), module.clone());

        return module;
    }

    /* ====================================================================== */

    pub fn get_plugin_path(&self) -> PathBuf {
        return self.path.clone();
    }

    pub fn get_assets_path(&self) -> PathBuf {
        return self.path.join(PLUGIN_ASSETS_DIR);
    }

    fn get_data_path(&self) -> PathBuf {
        return self.path.join(PLUGIN_DATA_DIR);
    }

    fn get_entrypoint_path(&self) -> PathBuf {
        return self.get_data_path().join(PLUGIN_ENTRYPOINT_FILE);
    }

    pub fn get_widgets_path(&self) -> PathBuf {
        return self.path.join(PLUGIN_WIDGETS_DIR);
    }

    fn get_icon_path(&self) -> Option<PathBuf> {
        let icon_path = self.path.join(PLUGIN_ICON_FILE);
        if icon_path.is_file() {
            return Some(icon_path);
        }

        return None;
    }

    /* ====================================================================== */

    pub fn get_icon(&self) -> Option<Vec<u8>> {
        return self.get_icon_path().and_then(|icon_path| fs::read(icon_path).ok());
    }
}

/* ========================================================================== */

fn has_plugins() -> bool {
    let user_plugins_dir = paths::get(AppPaths::UniChatUserPlugins);
    if let Ok(entries) = fs::read_dir(&user_plugins_dir) {
        for entry in entries.flatten() {
            let plugin_folder = entry.file_name().to_string_lossy().to_string();
            let plugin_path = entry.path();
            if !is_valid_addon_dir(&plugin_folder, &plugin_path) {
                continue;
            }

            let has_manifest = plugin_path.join(MANIFEST_FILE).is_file();
            let has_entrypoint = plugin_path.join(PLUGIN_DATA_DIR).join(PLUGIN_ENTRYPOINT_FILE).is_file();
            if has_manifest && has_entrypoint {
                return true;
            }
        }
    }

    return false;
}

pub fn init() -> Result<(), Error> {
    if !has_plugins() {
        log::info!("No plugins found, skipping LUA runtime");
        return Ok(());
    }

    return runtime::new();
}

fn load_plugins_from_disk(plugins_path: PathBuf) -> Result<Vec<(PathBuf, UniChatAddonManifest)>, Error> {
    if !plugins_path.is_dir() {
        return Ok(Vec::new());
    }

    let mut loaded_manifests: Vec<(PathBuf, UniChatAddonManifest)> = Vec::new();
    let entries = fs::read_dir(plugins_path)?;
    for entry in entries.flatten() {
        let plugin_folder = entry.file_name().to_string_lossy().to_string();
        let plugin_path = entry.path();
        if !is_valid_addon_dir(&plugin_folder, &plugin_path) {
            continue;
        }

        if !plugin_path.join(MANIFEST_FILE).is_file() {
            log::warn!("Skipping folder '{:?}' as it does not contain a valid '{}'", plugin_path, MANIFEST_FILE);
            continue;
        }

        log::debug!("Loading plugin manifest from directory: {:?}", plugin_path);
        match load_manifest(&plugin_path) {
            Ok(manifest) => {
                loaded_manifests.push((plugin_path, manifest));
            }
            Err(e) => {
                log::error!("Failed to load plugin manifest: {:#?}", e);
            }
        }
    }

    return Ok(loaded_manifests);
}

pub fn load_plugins() -> Result<(), Error> {
    if !runtime::initialized() {
        return Ok(());
    }

    let user_plugins_dir = paths::get(AppPaths::UniChatUserPlugins);
    let loaded_manifests = load_plugins_from_disk(user_plugins_dir)?;

    for (plugin_path, manifest) in loaded_manifests.iter() {
        log::info!("Loading plugin: {} v{}", manifest.name, manifest.version);
        if let Err(e) = instance::create(plugin_path, manifest) {
            log::error!("Failed to load user plugin: {:#?}", e);
        }
    }

    return Ok(());
}
