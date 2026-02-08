/*!******************************************************************************
 * UniChat
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

use anyhow::anyhow;
use anyhow::Error;

use crate::plugins::lua_env::LUA_RUNTIME_ONCE_LOCK_KEY;
use crate::plugins::lua_env::LUA_RUNTIME;
use crate::plugins::lua_env::prepare_lua_env;
use crate::plugins::plugin_instance::load_plugin;
use crate::plugins::plugin_manifest::PluginManifestYAML;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::semver;

mod lua_env;
mod plugin_instance;
mod plugin_manifest;
mod utils;

const LOADED_PLUGINS_LAZY_LOCK_KEY: &str = "Plugins::LOADED_PLUGINS";
static LOADED_PLUGINS: LazyLock<RwLock<HashMap<String, Arc<UniChatPlugin>>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

/* ============================================================================================== */

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "UPPERCASE")]
pub enum PluginStatus {
    Loaded,
    Invalid,
    Active,
    Error,
}

/* ============================================================================================== */

#[allow(dead_code)]
pub struct UniChatPlugin {
    pub manifest: PluginManifestYAML,

    pub name: String,
    pub description: Option<String>,
    pub version: semver::Version,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: Vec<(String, semver::VersionRange)>,

    status: RwLock<PluginStatus>,
    messages: RwLock<Vec<String>>,

    plugin_path: PathBuf,
    plugin_env: Arc<mlua::Table>,
    loaded_modules_cache: RwLock<HashMap<String, Arc<mlua::Value>>>,
}

impl UniChatPlugin {
    pub(in crate::plugins) fn new(plugin_path: &Path, manifest: &PluginManifestYAML, dependencies: Vec<(String, semver::VersionRange)>) -> Result<Self, Error> {
        let version = semver::Version::parse(&manifest.version)?;

        let lua = get_lua_runtime()?;
        let env = lua.create_table()?;
        let arc_env = Arc::new(env);

        return Ok(Self {
            manifest: manifest.clone(),

            name: manifest.name.clone(),
            description: manifest.description.clone(),
            version: version,
            author: manifest.author.clone(),
            license: manifest.license.clone(),
            homepage: manifest.homepage.clone(),
            dependencies: dependencies,

            status: RwLock::new(PluginStatus::Loaded),
            messages: RwLock::new(Vec::new()),

            plugin_path: plugin_path.to_path_buf(),
            plugin_env: arc_env,
            loaded_modules_cache: RwLock::new(HashMap::new())
        });
    }

    /* ====================================================================== */

    pub fn get_status(&self) -> PluginStatus {
        let status = self.status.read().unwrap();
        return status.clone();
    }

    pub(in crate::plugins) fn set_status(&self, status: PluginStatus) {
        let mut current_status = self.status.write().unwrap();
        *current_status = status;
    }

    /* ====================================================================== */

    pub fn get_messages(&self) -> Vec<String> {
        let messages = self.messages.read().unwrap();
        return messages.clone();
    }

    pub fn add_message<S: Into<String>>(&self, message: S) {
        let message = message.into();
        let mut messages = self.messages.write().unwrap();
        messages.push(message);
    }

    /* ====================================================================== */

    pub(in crate::plugins) fn get_plugin_env(&self) -> Result<Arc<mlua::Table>, Error> {
        return Ok(self.plugin_env.clone());
    }

    /* ====================================================================== */

    pub(in crate::plugins) fn get_cached_loaded_module(&self, module_name: &str) -> Result<mlua::Value, Error> {
        let cache = self.loaded_modules_cache.read().map_err(|_| anyhow!("Failed to acquire read lock on loaded modules cache"))?;
        if let Some(cached_module) = cache.get(module_name) {
            return Ok(cached_module.as_ref().clone());
        }

        return Err(anyhow!("Module '{}' is not cached", module_name));
    }

    pub(in crate::plugins) fn set_cached_loaded_module(&self, module_name: &str, module: Arc<mlua::Value>) -> Result<Arc<mlua::Value>, Error> {
        let mut cache = self.loaded_modules_cache.write().map_err(|_| anyhow!("Failed to acquire read lock on loaded modules cache"))?;
        cache.insert(module_name.to_string(), module);

        let cached_module = cache.get(module_name).ok_or(anyhow!("Failed to retrieve cached module '{}'", module_name))?;
        return Ok(cached_module.clone());
    }

    /* ====================================================================== */

    pub fn get_plugin_path(&self) -> PathBuf {
        return self.plugin_path.clone();
    }

    pub fn get_assets_path(&self) -> PathBuf {
        return self.plugin_path.join("assets");
    }

    pub fn get_data_path(&self) -> PathBuf {
        return self.plugin_path.join("data");
    }

    pub fn get_entrypoint_path(&self) -> PathBuf {
        return self.get_data_path().join("main.lua");
    }

    pub fn get_widgets_path(&self) -> PathBuf {
        return self.plugin_path.join("widgets");
    }

    /* ====================================================================== */

    pub fn get_icon(&self) -> Option<Vec<u8>> {
        let icon_path = self.plugin_path.join("icon.png");
        if icon_path.exists() {
            if let Ok(icon_data) = fs::read(icon_path) {
                return Some(icon_data);
            }
        }

        return None;
    }
}

/* ============================================================================================== */

pub fn get_plugins() -> Result<Vec<Arc<UniChatPlugin>>, Error> {
    let envs = LOADED_PLUGINS.read().map_err(|_| anyhow!("{} lock poisoned", LOADED_PLUGINS_LAZY_LOCK_KEY))?;

    let mut plugins: Vec<Arc<UniChatPlugin>> = Vec::new();
    for (_name, manifest) in envs.iter() {
        plugins.push(manifest.clone());
    }

    return Ok(plugins);
}

pub fn get_plugin(plugin_name: &str) -> Result<Arc<UniChatPlugin>, Error> {
    let envs = LOADED_PLUGINS.read().map_err(|_| anyhow!("{} lock poisoned", LOADED_PLUGINS_LAZY_LOCK_KEY))?;
    let manifest = envs.get(plugin_name).ok_or(anyhow!("Plugin '{}' is not loaded", plugin_name))?;
    return Ok(manifest.clone());
}

pub(in crate::plugins) fn get_lua_runtime() -> Result<Arc<mlua::Lua>, Error> {
    let lua = LUA_RUNTIME.get().ok_or(anyhow!("{} was not initialized", LUA_RUNTIME_ONCE_LOCK_KEY))?;
    return Ok(lua.clone());
}

/* ================================================================================================================== */

pub fn init() -> Result<(), Error> {
    prepare_lua_env()?;
    return Ok(());
}

fn load_plugins_from_disk(plugins_path: PathBuf) -> Result<Vec<(PathBuf, PluginManifestYAML)>, Error> {
    if !plugins_path.exists() || !plugins_path.is_dir() {
        return Ok(Vec::new());
    }

    let mut loaded_manifests: Vec<(PathBuf, PluginManifestYAML)> = Vec::new();
    for entry in fs::read_dir(plugins_path)? {
        if let Ok(entry) = entry {
            let plugin_path = entry.path();

            if plugin_path.is_dir() {
                let plugin_folder = plugin_path.file_name().unwrap_or_default().to_string_lossy().to_string();
                if plugin_folder.starts_with(".") {
                    continue;
                } else if plugin_folder.chars().any(|c| !c.is_ascii_alphanumeric() && c != '_' && c != '-') {
                    log::warn!("Skipping plugin with invalid name '{}' from {:?}", plugin_folder, plugin_path);
                    continue;
                }


                let manifest_path = plugin_path.join("manifest.yaml");
                if !manifest_path.exists() || !manifest_path.is_file() {
                    log::warn!("Skipping folder '{:?}' as it does not contain a valid 'manifest.yaml'", plugin_path);
                    continue;
                }

                log::info!("Loading plugin manifest from directory: {:?}", plugin_path);
                match plugin_manifest::load_manifest(&plugin_path) {
                    Ok(manifest) => {
                        loaded_manifests.push((plugin_path, manifest));
                    },
                    Err(e) => {
                        log::error!("Failed to load plugin manifest: {:?}", e);
                    }
                }
            }
        }
    }

    return Ok(loaded_manifests);


}

pub fn load_plugins() -> Result<(), Error> {
    let mut loaded_manifests: Vec<(PathBuf, PluginManifestYAML)> = Vec::new();

    let system_plugins_dir = properties::get_app_path(AppPaths::UniChatSystemPlugins);
    let system_plugins_manifests = load_plugins_from_disk(system_plugins_dir)?;
    loaded_manifests.extend(system_plugins_manifests);

    let user_plugins_dir = properties::get_app_path(AppPaths::UniChatUserPlugins);
    let user_plugins_manifests = load_plugins_from_disk(user_plugins_dir)?;
    loaded_manifests.extend(user_plugins_manifests);

    for (plugin_path, manifest) in loaded_manifests.iter_mut() {
        log::info!("Loading plugin: {} v{}", manifest.name, manifest.version);
        if let Err(e) = load_plugin(plugin_path, manifest) {
            log::error!("Failed to load user plugin: {:?}", e);
        }
    }

    return Ok(());
}
