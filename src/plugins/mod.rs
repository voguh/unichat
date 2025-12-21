/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::collections::HashSet;
use std::fs;
use std::path;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::OnceLock;
use std::sync::RwLock;

use serde::Deserialize;
use serde::Serialize;

use crate::CARGO_PKG_AUTHORS;
use crate::CARGO_PKG_HOMEPAGE;
use crate::CARGO_PKG_LICENSE_NAME;
use crate::CARGO_PKG_VERSION;
use crate::error::Error;
use crate::plugins::unichat_event::LuaUniChatAuthorTypeFactory;
use crate::plugins::unichat_event::LuaUniChatEventFactory;
use crate::plugins::unichat_event::LuaUniChatPlatformFactory;
use crate::plugins::unichat_api::UniChatAPI;

use crate::plugins::utils::table_deep_readonly;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

mod unichat_api;
mod unichat_event;
mod unichat_json;
mod unichat_logger;
mod unichat_std;
mod unichat_strings;
mod unichat_time;
mod unichat_yaml;
mod utils;

const PLUGIN_NAME_KEY: &str = "__PLUGIN_NAME";
const PLUGIN_VERSION_KEY: &str = "__PLUGIN_VERSION";
const UNICHAT_API_KEY: &str = "UniChatAPI";
const UNICHAT_EVENT_KEY: &str = "UniChatEvent";
const UNICHAT_PLATFORM_KEY: &str = "UniChatPlatform";
const UNICHAT_AUTHOR_TYPE_KEY: &str = "UniChatAuthorType";
const UNICHAT_EMOTE_KEY: &str = "UniChatEmote";
const UNICHAT_BADGE_KEY: &str = "UniChatBadge";
const INCLUSIVE_START: char = '[';
const INCLUSIVE_END: char = ']';
const EXCLUSIVE_START: char = '(';
const EXCLUSIVE_END: char = ')';

const LUA_RUNTIME_ONCE_LOCK_KEY: &str = "Plugins::LUA_RUNTIME";
static LUA_RUNTIME: OnceLock<Arc<mlua::Lua>> = OnceLock::new();
const APP_HANDLE_ONCE_LOCK_KEY: &str = "Plugins::APP_HANDLE";
static APP_HANDLE: OnceLock<tauri::AppHandle<tauri::Wry>> = OnceLock::new();
static LOADED_PLUGINS: LazyLock<RwLock<HashMap<String, Arc<UniChatPlugin>>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn get_plugins() -> Result<Vec<Arc<UniChatPlugin>>, Error> {
    let envs = LOADED_PLUGINS.read().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;

    let mut plugins: Vec<Arc<UniChatPlugin>> = Vec::new();
    for (_name, manifest) in envs.iter() {
        plugins.push(manifest.clone());
    }

    return Ok(plugins);
}

pub(in crate::plugins) fn get_loaded_plugin(plugin_name: &str) -> Result<Arc<UniChatPlugin>, mlua::Error> {
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

#[derive(Serialize, Deserialize, Debug)]
struct PluginManifestYAML {
    name: String,
    description: Option<String>,
    version: String,
    author: Option<String>,
    license: Option<String>,
    homepage: Option<String>,
    dependencies: Vec<String>
}

#[allow(dead_code)]
pub struct UniChatPlugin {
    pub name: String,
    pub description: Option<String>,
    pub version: semver::Version,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: Vec<(String, semver::VersionReq)>,

    plugin_path: path::PathBuf,
    plugin_env: Arc<mlua::Table>,
    loaded_modules_cache: RwLock<HashMap<String, Arc<mlua::Value>>>,
}

impl UniChatPlugin {
    pub(in crate::plugins) fn new(manifest: &PluginManifestYAML, dependencies: Vec<(String, semver::VersionReq)>, plugin_path: path::PathBuf) -> Result<Self, Error> {
        let version = semver::Version::parse(&manifest.version)?;

        let lua = get_lua_runtime()?;
        let env = lua.create_table()?;
        let arc_env = Arc::new(env);

        return Ok(Self {
            name: manifest.name.clone(),
            description: manifest.description.clone(),
            version: version,
            author: manifest.author.clone(),
            license: manifest.license.clone(),
            homepage: manifest.homepage.clone(),
            dependencies: dependencies,
            plugin_path: plugin_path,
            plugin_env: arc_env,
            loaded_modules_cache: RwLock::new(HashMap::new()),
        });
    }

    pub(in crate::plugins) fn get_plugin_env(&self) -> mlua::Result<Arc<mlua::Table>> {
        return Ok(self.plugin_env.clone());
    }

    pub(in crate::plugins) fn get_cached_loaded_module(&self, module_name: &str) -> mlua::Result<mlua::Value> {
        let cache = self.loaded_modules_cache.read().map_err(mlua::Error::runtime)?;
        if let Some(cached_module) = cache.get(module_name) {
            return Ok(cached_module.as_ref().clone());
        }

        return Err(mlua::Error::runtime(format!("Module '{}' is not cached", module_name)));
    }

    pub(in crate::plugins) fn set_cached_loaded_module(&self, module_name: &str, module: Arc<mlua::Value>) -> mlua::Result<Arc<mlua::Value>> {
        let mut cache = self.loaded_modules_cache.write().map_err(mlua::Error::runtime)?;
        cache.insert(module_name.to_string(), module);
        return Ok(cache.get(module_name).unwrap().clone());
    }

    pub fn get_plugin_assets_path(&self) -> path::PathBuf {
        return self.plugin_path.join("assets");
    }

    pub fn get_plugin_data_path(&self) -> path::PathBuf {
        return self.plugin_path.join("data");
    }

    pub fn get_entrypoint_path(&self) -> path::PathBuf {
        return self.get_plugin_data_path().join("main.lua");
    }
}

/* ================================================================================================================== */

fn configure_lua_env() -> Result<(), Error> {
    log::info!("Configuring LUA runtime");
    let lua = mlua::Lua::new();
    let _globals = lua.globals();

    /* <======================[ LUA Standard Library ]======================> */
    log::debug!("Configuring LUA standard library");
    _globals.set("_G", mlua::Value::Nil)?;
    _globals.set("coroutine", mlua::Value::Nil)?;
    _globals.set("debug", mlua::Value::Nil)?;
    _globals.set("dofile", mlua::Value::Nil)?;
    _globals.set("getmetatable", mlua::Value::Nil)?;
    _globals.set("io", mlua::Value::Nil)?;
    _globals.set("load", mlua::Value::Nil)?;
    _globals.set("loadfile", mlua::Value::Nil)?;

    let _os: mlua::Table = _globals.get("os")?;
    _os.set("execute", mlua::Value::Nil)?;
    _os.set("exit", mlua::Value::Nil)?;
    _os.set("getenv", mlua::Value::Nil)?;
    _os.set("remove", mlua::Value::Nil)?;
    _os.set("rename", mlua::Value::Nil)?;
    _os.set("setlocale", mlua::Value::Nil)?;
    _os.set("tmpname", mlua::Value::Nil)?;
    _globals.set("os", _os)?;

    _globals.set("package", mlua::Value::Nil)?;
    _globals.set("print", mlua::Value::Nil)?;
    _globals.set("rawequal", mlua::Value::Nil)?;
    _globals.set("rawget", mlua::Value::Nil)?;
    _globals.set("rawlen", mlua::Value::Nil)?;
    _globals.set("rawset", mlua::Value::Nil)?;
    _globals.set("require", mlua::Value::Nil)?;

    _globals.set("setmetatable", mlua::Value::Nil)?;

    let _string: mlua::Table = _globals.get("string")?;
    _string.set("dump", mlua::Value::Nil)?;
    _globals.set("string", _string)?;
    /* <====================[ End LUA Standard Library ]====================> */

    log::debug!("Setting LUA globals as read-only");
    for pair in _globals.pairs::<mlua::Value, mlua::Value>() {
        let (key, value) = pair?;
        if let mlua::Value::Table(table) = value {
            let readonly_table = table_deep_readonly(&lua, &key, table)?;
            _globals.set(key, readonly_table)?;
        }
    }

    lua.set_globals(_globals)?;
    log::debug!("LUA runtime configured successfully");

    return LUA_RUNTIME.set(Arc::new(lua)).map_err(|_| Error::OnceLockAlreadyInitialized(LUA_RUNTIME_ONCE_LOCK_KEY));
}

fn create_lua_env(plugin: Arc<UniChatPlugin>) -> Result<(), Error> {
    let lua = LUA_RUNTIME.get().ok_or(Error::OnceLockNotInitialized(LUA_RUNTIME_ONCE_LOCK_KEY))?;
    let plugin_env = plugin.get_plugin_env()?;

    /* <======================[ LUA Standard Library ]======================> */
    let print_func = unichat_std::create_print_fn(lua, &plugin.name)?;
    plugin_env.set("print", print_func)?;

    let require_fn = unichat_std::create_require_fn(lua, &plugin.name)?;
    plugin_env.set("require", require_fn)?;
    /* <====================[ End LUA Standard Library ]====================> */

    /* <====================[ UniChat Standard Library ]====================> */
    plugin_env.set(PLUGIN_NAME_KEY, plugin.name.clone())?;
    plugin_env.set(PLUGIN_VERSION_KEY, plugin.version.to_string())?;
    plugin_env.set(UNICHAT_API_KEY, UniChatAPI::new(&plugin.name))?;
    plugin_env.set(UNICHAT_PLATFORM_KEY, LuaUniChatPlatformFactory)?;
    plugin_env.set(UNICHAT_AUTHOR_TYPE_KEY, LuaUniChatAuthorTypeFactory)?;
    plugin_env.set(UNICHAT_EVENT_KEY, LuaUniChatEventFactory)?;
    plugin_env.set(UNICHAT_EMOTE_KEY, unichat_event::LuaUniChatEmoteFactory)?;
    plugin_env.set(UNICHAT_BADGE_KEY, unichat_event::LuaUniChatBadgeFactory)?;
    /* <==================[ End UniChat Standard Library ]==================> */

    let mt = lua.create_table()?;
    let mut protected_keys: HashSet<String> = HashSet::new();
    for pair in lua.globals().pairs::<mlua::Value, mlua::Value>() {
        let (k, _) = pair?;
        if let mlua::Value::String(s) = k {
            protected_keys.insert(s.to_string_lossy().to_string());
        }
    }
    for pair in plugin_env.pairs::<mlua::Value, mlua::Value>() {
        let (k, _) = pair?;
        if let mlua::Value::String(s) = k {
            protected_keys.insert(s.to_string_lossy().to_string());
        }
    }
    let newindex_func = lua.create_function(move |_, (table, key, value): (mlua::Table, mlua::Value, mlua::Value)| -> mlua::Result<()> {
        if let mlua::Value::String(key) = &key  {
            let k = key.to_string_lossy();
            if protected_keys.contains(k.as_str()) {
                return Err(mlua::Error::runtime(format!("Immutable table: cannot modify key '{}'", k)));
            }
        }

        table.raw_set(key, value)?;
        return Ok(());
    })?;
    mt.set("__newindex", newindex_func)?;
    mt.set("__index", lua.globals())?;
    mt.set("__metatable", mlua::Value::Boolean(false))?;
    plugin_env.set_metatable(Some(mt))?;

    /* ========================================================================================== */

    log::info!("Executing plugin entrypoint for plugin: {} v{}", plugin.name, plugin.version);
    let entrypoint_code = fs::read_to_string(plugin.get_entrypoint_path())?;
    lua.load(&entrypoint_code).set_environment(plugin_env.as_ref().clone()).exec()?;

    return Ok(());
}

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

fn load_plugin(plugin_path: path::PathBuf) -> Result<(), Error> {
    let manifest_path = plugin_path.join("manifest.yaml");
    if !manifest_path.exists() || !manifest_path.is_file() {
        return Err(Error::Message(format!("Folder '{:?}' is not a valid plugin: missing or invalid 'manifest.yaml'", plugin_path)));
    }

    let manifest_content = fs::read_to_string(&manifest_path)?;
    let mut manifest: PluginManifestYAML = serde_saphyr::from_str(&manifest_content)?;

    if plugin_path.starts_with(properties::get_app_path(AppPaths::UniChatSystemPlugins)) {
        if manifest.version == "${unichat_version}" {
            manifest.version = String::from(CARGO_PKG_VERSION);
        }

        if manifest.author.as_deref().is_some_and(|a| a == "${unichat_authors}") {
            manifest.author = Some(String::from(CARGO_PKG_AUTHORS));
        }

        if manifest.license.as_deref().is_some_and(|l| l == "${unichat_license}") {
            manifest.license = Some(String::from(CARGO_PKG_LICENSE_NAME));
        }

        if manifest.homepage.as_deref().is_some_and(|h| h == "${unichat_homepage}") {
            manifest.homepage = Some(String::from(CARGO_PKG_HOMEPAGE));
        }
    }

    if let Err(err) = semver::Version::parse(&manifest.version) {
        return Err(Error::Message(format!("Invalid version '{}' for plugin '{}': {:?}", manifest.version, manifest.name, err)));
    }

    let parsed_dependencies = parse_dependencies(&manifest.dependencies)?;
    for (key, version_req) in parsed_dependencies.iter() {
        if key == "unichat" {
            let unichat_version = semver::Version::parse(CARGO_PKG_VERSION)?;
            if !version_req.matches(&unichat_version) {
                return Err(Error::Message(format!("Plugin '{}' requires unichat version '{}' which does not satisfy the current version '{}'", manifest.name, version_req, unichat_version)));
            }
        }
    }

    let plugin = UniChatPlugin::new(&manifest, parsed_dependencies, plugin_path.clone())?;
    let plugin = Arc::new(plugin);

    if !plugin.get_plugin_data_path().is_dir() {
        return Err(Error::Message(format!("Plugin folder '{:?}' is missing required 'data' directory", plugin_path)));
    } else if !plugin.get_entrypoint_path().is_file() {
        return Err(Error::Message(format!("Plugin folder '{:?}' is missing required 'data/main.lua' entrypoint file", plugin_path)));
    }

    log::info!("Loading plugin: {} v{}", plugin.name, plugin.version);
    {
        let mut loaded_plugins = LOADED_PLUGINS.write().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;
        if loaded_plugins.contains_key(&plugin.name) {
            return Err(Error::Message(format!("Plugin with name '{}' is already loaded", plugin.name)));
        }

        loaded_plugins.insert(plugin.name.clone(), plugin.clone());
    }

    if let Err(e) = create_lua_env(plugin.clone()) {
        let mut loaded_plugins = LOADED_PLUGINS.write().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;
        loaded_plugins.remove(&plugin.name);
        return Err(Error::Message(format!("Failed to load plugin '{}': {}", plugin.name, e)));
    }

    log::info!("Loaded plugin: {} v{}", plugin.name, plugin.version);

    return Ok(());
}

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    APP_HANDLE.set(app.handle().clone()).map_err(|_| Error::OnceLockAlreadyInitialized(APP_HANDLE_ONCE_LOCK_KEY))?;
    configure_lua_env()?;
    return Ok(());
}

pub fn load_plugins() -> Result<(), Error> {
    let system_plugins_dir = properties::get_app_path(AppPaths::UniChatSystemPlugins);
    for entry in fs::read_dir(system_plugins_dir)? {
        if let Ok(entry) = entry {
            let path = entry.path();

            if path.is_dir() {
                log::info!("Found system plugin directory: {:?}", path);
                if let Err(e) = load_plugin(path) {
                    log::error!("Failed to load system plugin: {:?}", e);
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
                if let Err(e) = load_plugin(path) {
                    log::error!("Failed to load user plugin: {:?}", e);
                }
            }
        }
    }

    return Ok(());
}
