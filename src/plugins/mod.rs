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
use std::sync::LazyLock;
use std::sync::OnceLock;
use std::sync::RwLock;

use crate::CARGO_PKG_VERSION;
use crate::error::Error;

use crate::plugins::lua_env::LUA_RUNTIME;
use crate::plugins::lua_env::LUA_RUNTIME_ONCE_LOCK_KEY;
use crate::plugins::lua_env::load_plugin_env;
use crate::plugins::lua_env::prepare_lua_env;
use crate::plugins::plugin_instance::UniChatPlugin;
use crate::plugins::plugin_manifest::PluginManifestYAML;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

mod lua_env;
mod plugin_instance;
mod plugin_manifest;
mod utils;

const INCLUSIVE_START: char = '[';
const INCLUSIVE_END: char = ']';
const EXCLUSIVE_START: char = '(';
const EXCLUSIVE_END: char = ')';

const APP_HANDLE_ONCE_LOCK_KEY: &str = "Plugins::APP_HANDLE";
static APP_HANDLE: OnceLock<tauri::AppHandle<tauri::Wry>> = OnceLock::new();
static LOADED_PLUGINS: LazyLock<RwLock<HashMap<String, Arc<UniChatPlugin>>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

/* ============================================================================================== */

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "UPPERCASE")]
pub enum PluginStatus {
    Loaded,
    Error,
    Active
}

/* ============================================================================================== */

pub fn get_plugins() -> Result<Vec<Arc<UniChatPlugin>>, Error> {
    let envs = LOADED_PLUGINS.read().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;

    let mut plugins: Vec<Arc<UniChatPlugin>> = Vec::new();
    for (_name, manifest) in envs.iter() {
        plugins.push(manifest.clone());
    }

    return Ok(plugins);
}

pub fn get_plugin(plugin_name: &str) -> Result<Arc<UniChatPlugin>, mlua::Error> {
    let envs = LOADED_PLUGINS.read().map_err(|e| mlua::Error::runtime(e))?;
    let manifest = envs.get(plugin_name).ok_or(mlua::Error::runtime(format!("Plugin '{}' is not loaded", plugin_name)))?;
    return Ok(manifest.clone());
}

pub(in crate::plugins) fn get_lua_runtime() -> Result<Arc<mlua::Lua>, Error> {
    let lua = LUA_RUNTIME.get().ok_or(Error::OnceLockNotInitialized(LUA_RUNTIME_ONCE_LOCK_KEY))?;
    return Ok(lua.clone());
}

pub(in crate::plugins) fn get_app_handle() -> Result<tauri::AppHandle<tauri::Wry>, mlua::Error> {
    let app_handle = APP_HANDLE.get().ok_or(mlua::Error::runtime(Error::OnceLockNotInitialized(APP_HANDLE_ONCE_LOCK_KEY)))?;
    return Ok(app_handle.clone());
}

/* ================================================================================================================== */

fn parse_dependency_version(version: &str) -> Result<semver::VersionReq, Error> {
    let v = version.trim();

    let first = v.chars().next();
    let last = v.chars().last();

    if matches!(first, Some(INCLUSIVE_START | EXCLUSIVE_START)) && matches!(last, Some(INCLUSIVE_END | EXCLUSIVE_END)) {
        let (min, max) = v[1..v.len() -1].split_once(',').ok_or(Error::Message(format!("Invalid dependency version range: '{}'", version)))?;
        let min = min.trim();
        let max = max.trim();

        let mut parts = Vec::new();
        if !min.is_empty() {
            let min_op = if first == Some(INCLUSIVE_START) { ">=" } else { ">" };
            parts.push(format!("{} {}", min_op, min));
        }

        if !max.is_empty() {
            let max_op = if last == Some(INCLUSIVE_END) { "<=" } else { "<" };
            parts.push(format!("{} {}", max_op, max));
        }

        let range_str = parts.join(", ");
        let version_req = semver::VersionReq::parse(&range_str)?;
        return Ok(version_req);
    }

    let version_req = semver::VersionReq::parse(version)?;
    return Ok(version_req);
}

fn parse_dependencies(raw_dependencies: &Vec<String>) -> Result<Vec<(String, semver::VersionReq)>, Error> {
    let mut dependencies: Vec<(String, semver::VersionReq)> = Vec::new();

    for dep in raw_dependencies {
        let parts: Vec<&str> = dep.splitn(2, '@').collect();
        if parts.len() != 2 {
            return Err(Error::Message(format!("Invalid dependency format: '{}'. Expected format is 'name@version_req'", dep)));
        }

        let name = parts[0].trim().to_string();
        let version = parts[1].trim();
        let version_req = parse_dependency_version(version)?;

        dependencies.push((name, version_req));
    }

    return Ok(dependencies);
}

fn load_plugin(plugin_path: &Path, manifest: &PluginManifestYAML) -> Result<(), Error> {
    let parsed_dependencies = parse_dependencies(&manifest.dependencies)?;
    let plugin = UniChatPlugin::new(plugin_path, &manifest, parsed_dependencies)?;
    let plugin = Arc::new(plugin);

    for (key, version_req) in plugin.dependencies.iter() {
        if key == "unichat" {
            let unichat_version = semver::Version::parse(CARGO_PKG_VERSION)?;
            if !version_req.matches(&unichat_version) {
                plugin.add_message(format!("Required unichat version '{}' does not satisfy the current version '{}'", version_req, unichat_version));
                return Err(Error::Message(format!("Plugin '{}' requires unichat version '{}' which does not satisfy the current version '{}'", manifest.name, version_req, unichat_version)));
            }
        }
    }

    if !plugin.get_plugin_data_path().is_dir() {
        let msg = format!("Plugin folder '{:?}' is missing required 'data' directory", plugin_path);
        plugin.add_message(&msg);
        plugin.set_status(PluginStatus::Error);
        return Err(Error::Message(msg));
    } else if !plugin.get_entrypoint_path().is_file() {
        let msg = format!("Plugin folder '{:?}' is missing required 'data/main.lua' entrypoint file", plugin_path);
        plugin.add_message(&msg);
        plugin.set_status(PluginStatus::Error);
        return Err(Error::Message(msg));
    }

    {
        let mut loaded_plugins = LOADED_PLUGINS.write().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;
        if loaded_plugins.contains_key(&plugin.name) {
            return Err(Error::Message(format!("Plugin with name '{}' is already loaded", plugin.name)));
        }

        loaded_plugins.insert(plugin.name.clone(), plugin.clone());
        plugin.set_status(PluginStatus::Loaded);
    }

    if let Err(e) = load_plugin_env(&plugin) {
        plugin.add_message(format!("An error occurred on start plugin: {:?}", e));
        plugin.set_status(PluginStatus::Error);
        return Err(Error::Message(format!("Failed to create LUA environment for plugin '{}': {:?}", plugin.name, e)));
    }

    plugin.set_status(PluginStatus::Active);
    log::info!("Loaded plugin: {} v{}", plugin.name, plugin.version);

    return Ok(());
}

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    APP_HANDLE.set(app.handle().clone()).map_err(|_| Error::OnceLockAlreadyInitialized(APP_HANDLE_ONCE_LOCK_KEY))?;
    prepare_lua_env()?;
    return Ok(());
}

pub fn load_plugins() -> Result<(), Error> {
    let mut loaded_manifests: Vec<(PathBuf, PluginManifestYAML)> = Vec::new();

    let system_plugins_dir = properties::get_app_path(AppPaths::UniChatSystemPlugins);
    for entry in fs::read_dir(system_plugins_dir)? {
        if let Ok(entry) = entry {
            let path = entry.path();

            if path.is_dir() {
                log::info!("Found system plugin directory: {:?}", path);
                match plugin_manifest::load_manifest(&path) {
                    Ok(manifest) => {
                        loaded_manifests.push((path, manifest));
                    },
                    Err(e) => {
                        log::error!("Failed to load system plugin manifest: {:?}", e);
                    }
                }
            }
        }
    }

    let user_plugins_dir = properties::get_app_path(AppPaths::UniChatUserPlugins);
    for entry in fs::read_dir(user_plugins_dir)? {
        if let Ok(entry) = entry {
            let path = entry.path();

            if path.is_dir() {
                log::info!("Found user plugin directory: {:?}", path);
                match plugin_manifest::load_manifest(&path) {
                    Ok(manifest) => {
                        loaded_manifests.push((path, manifest));
                    },
                    Err(e) => {
                        log::error!("Failed to load user plugin manifest: {:?}", e);
                    }
                }
            }
        }
    }

    for (plugin_path, manifest) in loaded_manifests.iter_mut() {
        log::info!("Loading plugin: {} v{}", manifest.name, manifest.version);
        if let Err(e) = load_plugin(plugin_path, manifest) {
            log::error!("Failed to load user plugin: {:?}", e);
        }
    }

    return Ok(());
}
