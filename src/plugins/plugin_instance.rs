/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::RwLock;

use anyhow::Error;

use crate::plugins::get_lua_runtime;
use crate::plugins::plugin_manifest::PluginManifestYAML;
use crate::plugins::PluginStatus;

#[allow(dead_code)]
pub struct UniChatPlugin {
    pub manifest: PluginManifestYAML,

    pub name: String,
    pub description: Option<String>,
    pub version: semver::Version,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: Vec<(String, semver::VersionReq)>,

    status: RwLock<PluginStatus>,
    messages: RwLock<Vec<String>>,

    plugin_path: PathBuf,
    plugin_env: Arc<mlua::Table>,
    loaded_modules_cache: RwLock<HashMap<String, Arc<mlua::Value>>>,
}

impl UniChatPlugin {
    pub(in crate::plugins) fn new(plugin_path: &Path, manifest: &PluginManifestYAML, dependencies: Vec<(String, semver::VersionReq)>) -> Result<Self, Error> {
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

    /* ============================================================================================================== */

    pub fn get_status(&self) -> PluginStatus {
        let status = self.status.read().unwrap();
        return status.clone();
    }

    pub(in crate::plugins) fn set_status(&self, status: PluginStatus) {
        let mut current_status = self.status.write().unwrap();
        *current_status = status;
    }

    /* ============================================================================================================== */

    pub fn get_messages(&self) -> Vec<String> {
        let messages = self.messages.read().unwrap();
        return messages.clone();
    }

    pub(in crate::plugins) fn add_message<S: Into<String>>(&self, message: S) {
        let message = message.into();
        let mut messages = self.messages.write().unwrap();
        messages.push(message);
    }

    /* ============================================================================================================== */

    pub(in crate::plugins) fn get_plugin_env(&self) -> Result<Arc<mlua::Table>, Error> {
        return Ok(self.plugin_env.clone());
    }

    /* ============================================================================================================== */

    pub(in crate::plugins) fn get_cached_loaded_module(&self, module_name: &str) -> Result<mlua::Value, Error> {
        let cache = self.loaded_modules_cache.read().map_err(|_| anyhow::anyhow!("Failed to acquire read lock on loaded modules cache"))?;
        if let Some(cached_module) = cache.get(module_name) {
            return Ok(cached_module.as_ref().clone());
        }

        return Err(anyhow::anyhow!("Module '{}' is not cached", module_name));
    }

    pub(in crate::plugins) fn set_cached_loaded_module(&self, module_name: &str, module: Arc<mlua::Value>) -> Result<Arc<mlua::Value>, Error> {
        let mut cache = self.loaded_modules_cache.write().map_err(|_| anyhow::anyhow!("Failed to acquire read lock on loaded modules cache"))?;
        cache.insert(module_name.to_string(), module);

        let cached_module = cache.get(module_name).ok_or(anyhow::anyhow!("Failed to retrieve cached module '{}'", module_name))?;
        return Ok(cached_module.clone());
    }

    /* ============================================================================================================== */

    pub fn get_plugin_path(&self) -> PathBuf {
        return self.plugin_path.clone();
    }

    pub fn get_plugin_assets_path(&self) -> PathBuf {
        return self.plugin_path.join("assets");
    }

    pub fn get_plugin_data_path(&self) -> PathBuf {
        return self.plugin_path.join("data");
    }

    pub fn get_entrypoint_path(&self) -> PathBuf {
        return self.get_plugin_data_path().join("main.lua");
    }

    /* ============================================================================================================== */

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
