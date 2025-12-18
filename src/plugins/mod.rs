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

use mlua::LuaSerdeExt as _;
use serde::Deserialize;
use serde::Serialize;

use crate::CARGO_PKG_AUTHORS;
use crate::CARGO_PKG_HOMEPAGE;
use crate::CARGO_PKG_LICENSE_NAME;
use crate::CARGO_PKG_VERSION;
use crate::error::Error;
use crate::events;
use crate::events::unichat::UniChatEvent;
use crate::plugins::unichat_event::LuaUniChatAuthorType;
use crate::plugins::unichat_event::LuaUniChatEvent;
use crate::plugins::unichat_event::LuaUniChatPlatform;
use crate::scrapper;
use crate::scrapper::UniChatScrapper;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::render_emitter;
use crate::utils::safe_guard_path;

mod unichat_event;
mod unichat_json;
mod unichat_logger;
mod unichat_time;

#[derive(Serialize, Deserialize, Debug)]
struct PluginManifestYAML {
    name: String,
    description: Option<String>,
    version: String,
    author: Option<String>,
    license: Option<String>,
    homepage: Option<String>,
    dependencies: Option<Vec<String>>
}

#[allow(dead_code)]
pub struct PluginManifest {
    pub name: String,
    pub description: Option<String>,
    pub version: String,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: Vec<(String, semver::VersionReq)>,
    pub plugin_path: path::PathBuf
}

const PLUGIN_NAME_KEY: &str = "__plugin_name";
const PLUGIN_VERSION_KEY: &str = "__plugin_version";
const UNICHAT_API_KEY: &str = "UniChatAPI";
const UNICHAT_EVENT_KEY: &str = "UniChatEvent";
const UNICHAT_PLATFORM_KEY: &str = "UniChatPlatform";
const UNICHAT_AUTHOR_TYPE_KEY: &str = "UniChatAuthorType";
const INCLUSIVE_START: char = '[';
const INCLUSIVE_END: char = ']';
const EXCLUSIVE_START: char = '(';
const EXCLUSIVE_END: char = ')';

const LUA_RUNTIME_ONCE_LOCK_KEY: &str = "Plugins::LUA_RUNTIME";
static LUA_RUNTIME: OnceLock<Arc<mlua::Lua>> = OnceLock::new();
const APP_HANDLE_ONCE_LOCK_KEY: &str = "Plugins::APP_HANDLE";
static APP_HANDLE: OnceLock<tauri::AppHandle<tauri::Wry>> = OnceLock::new();
static LOADED_PLUGINS: LazyLock<RwLock<HashMap<String, Arc<PluginManifest>>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn get_plugins() -> Result<Vec<Arc<PluginManifest>>, Error> {
    let envs = LOADED_PLUGINS.read().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;

    let mut plugins: Vec<Arc<PluginManifest>> = Vec::new();
    for (_name, manifest) in envs.iter() {
        plugins.push(manifest.clone());
    }

    return Ok(plugins);
}

fn get_app_handle() -> Result<tauri::AppHandle<tauri::Wry>, mlua::Error> {
    let app_handle = APP_HANDLE.get().ok_or(mlua::Error::runtime(Error::OnceLockNotInitialized(APP_HANDLE_ONCE_LOCK_KEY)))?;
    return Ok(app_handle.clone());
}

fn get_loaded_plugin_manifest(plugin_name: &str) -> Result<Arc<PluginManifest>, mlua::Error> {
    let envs = LOADED_PLUGINS.read().map_err(|e| mlua::Error::runtime(e))?;
    let manifest = envs.get(plugin_name).ok_or(mlua::Error::runtime(format!("Plugin '{}' is not loaded", plugin_name)))?;
    return Ok(manifest.clone());
}

/* ============================================================================================== */

fn get_property_from_table<R: mlua::FromLua>(table: &mlua::Table, k1: &str, k2: Option<&'static str>, default_value: Option<R>) -> Result<R, mlua::Error> {
    if let Ok(v1) = table.get(k1) {
        return Ok(v1);
    } else if let Some(k2) = k2 {
        if let Ok(v2) = table.get(k2) {
            return Ok(v2);
        }
    }

    if let Some(default_value) = default_value {
        return Ok(default_value);
    }

    return Err(mlua::Error::runtime(format!("Table is missing '{}' field", k1)));
}

pub struct UniChatScrapperLua {
    table: mlua::Table,

    id: String,
    name: String,
    editing_tooltip_message: String,
    editing_tooltip_urls: Vec<String>,
    placeholder_text: String,
    badges: Vec<String>,
    icon: String,
    validate_url: mlua::Function,
    on_event: mlua::Function,
    scrapper_js: String
}

impl UniChatScrapperLua {
    fn new(table: mlua::Table, scrapper_js: String) -> Result<Self, mlua::Error> {
        let id: String = get_property_from_table(&table, "id", None, None)?;
        let name: String = get_property_from_table(&table, "name", None, None)?;
        let editing_tooltip_message: String = get_property_from_table(&table, "editingTooltipMessage", Some("editing_tooltip_message"), Some(format!("You can enter one of the following URLs to get the {} chat:", name)))?;
        let editing_tooltip_urls: Vec<String> = get_property_from_table(&table, "editingTooltipUrls", Some("editing_tooltip_urls"), Some(Vec::new()))?;
        let placeholder_text: String = get_property_from_table(&table, "placeholderText", Some("placeholder_text"), Some(format!("Enter {} chat url...", name)))?;
        let badges: Vec<String> = get_property_from_table(&table, "badges", None, Some(Vec::new()))?;
        let icon: String = get_property_from_table(&table, "icon", None, Some(String::from("fas fa-video")))?;
        let validate_url: mlua::Function = get_property_from_table(&table, "validateUrl", Some("validate_url"), None)?;
        let on_event: mlua::Function = get_property_from_table(&table, "onEvent", Some("on_event"), None)?;

        return Ok(Self {
            table: table,

            id: id,
            name: name,
            editing_tooltip_message: editing_tooltip_message,
            editing_tooltip_urls: editing_tooltip_urls,
            placeholder_text: placeholder_text,
            badges: badges,
            icon: icon,
            validate_url: validate_url,
            on_event: on_event,
            scrapper_js: scrapper_js
        });
    }
}

impl UniChatScrapper for UniChatScrapperLua {
    fn id(&self) -> &str {
        return &self.id;
    }

    fn name(&self) -> &str {
        return &self.name;
    }

    fn editing_tooltip_message(&self) -> &str {
        return &self.editing_tooltip_message;
    }

    fn editing_tooltip_urls(&self) -> &[String] {
        return &self.editing_tooltip_urls;
    }

    fn placeholder_text(&self) -> &str {
        return &self.placeholder_text;
    }

    fn badges(&self) -> &[String] {
        return &self.badges;
    }

    fn icon(&self) -> &str {
        return &self.icon;
    }

    fn validate_url(&self, url: String) -> Result<String, Error> {
        let result = self.validate_url.call(url)?;
        return Ok(result);
    }

    fn on_event(&self, event: serde_json::Value) -> Result<(), Error> {
        let lua = LUA_RUNTIME.get().ok_or(Error::OnceLockNotInitialized(LUA_RUNTIME_ONCE_LOCK_KEY))?;
        let table = lua.to_value(&event)?;
        let result = self.on_event.call(table)?;
        return Ok(result)
    }

    fn scrapper_js(&self) -> &str {
        return &self.scrapper_js;
    }
}

/* ============================================================================================== */

struct UniChatAPI {
    plugin_name: String
}

impl UniChatAPI {
    fn new(plugin_name: String) -> Self {
        return Self { plugin_name };
    }
}

impl mlua::UserData for UniChatAPI {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("get_version", |_lua, _this, ()| {
            return Ok(CARGO_PKG_VERSION.to_string());
        });

        methods.add_method("register_scrapper", |_lua, this, scrapper: mlua::Table| {
            let app_handle = get_app_handle()?;
            let manifest = get_loaded_plugin_manifest(&this.plugin_name)?;

            let scrapper_js_path: String = scrapper.get("scrapper_js_path")?;
            let scrapper_js_path = manifest.plugin_path.join("data").join(scrapper_js_path);
            let scrapper_js_content = fs::read_to_string(scrapper_js_path).map_err(|e| mlua::Error::external(e))?;
            let scrapper = UniChatScrapperLua::new(scrapper, scrapper_js_content)?;

            let scrapper: Arc<dyn UniChatScrapper + Send + Sync> = Arc::new(scrapper);
            scrapper::register_scrapper(&app_handle, scrapper).map_err(|e| mlua::Error::runtime(e.to_string()))?;

            return Ok(());
        });

        methods.add_method("emit_status_event", |lua, _this, payload: mlua::Value| {
            let value: serde_json::Value = lua.from_value(payload)?;
            render_emitter::emit(value).map_err(|e| mlua::Error::runtime(e.to_string()))?;
            return Ok(());
        });

        methods.add_method("emit_unichat_event", |lua, _this, payload: mlua::Value| {
            let value: UniChatEvent = lua.from_value(payload)?;
            events::emit(value).map_err(|e| mlua::Error::runtime(e.to_string()))?;
            return Ok(());
        });
    }
}

/* ============================================================================================== */

fn table_deep_readonly_(lua: &mlua::Lua, table_name: &mlua::Value, table: mlua::Table) -> Result<mlua::Table, Error> {
    let mt = lua.create_table()?;

    let table_name = table_name.to_string()?;
    let newindex_func = lua.create_function(move |_, _args: mlua::Variadic<mlua::Value>| -> mlua::Result<()> {
        return Err(mlua::Error::runtime(format!("Immutable table: cannot modify table '{}'", table_name)));
    })?;
    mt.set("__newindex", newindex_func)?;
    mt.set("__metatable", mlua::Value::Boolean(false))?;

    for pair in table.pairs::<mlua::Value, mlua::Value>() {
        let (key, value) = pair?;
        if let mlua::Value::Table(inner_table) = value {
            let readonly_inner_table = table_deep_readonly_(lua, &key, inner_table)?;
            table.set(key, readonly_inner_table)?;
        } else {
            table.set(key, value)?;
        }
    }

    table.set_metatable(Some(mt))?;

    return Ok(table);
}

fn configure_lua_env() -> Result<(), Error> {
    log::info!("Configuring LUA runtime");
    let lua = mlua::Lua::new();
    let _globals = lua.globals();

    /* <==========================================[ LUA Standard Library ]==========================================> */
    log::debug!("Configuring LUA standard library");
    _globals.set("_G", mlua::Value::Nil)?;
    _globals.set("coroutine", mlua::Value::Nil)?;
    _globals.set("debug", mlua::Value::Nil)?;
    _globals.set("dofile", mlua::Value::Nil)?;
    // _globals.set("getmetatable", mlua::Value::Nil)?;
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

    // _globals.set("setmetatable", mlua::Value::Nil)?;

    let _string: mlua::Table = _globals.get("string")?;
    _string.set("dump", mlua::Value::Nil)?;
    _globals.set("string", _string)?;
    /* <========================================[ End LUA Standard Library ]========================================> */

    log::debug!("Setting LUA globals as read-only");
    for pair in _globals.pairs::<mlua::Value, mlua::Value>() {
        let (key, value) = pair?;
        if let mlua::Value::Table(table) = value {
            let readonly_table = table_deep_readonly_(&lua, &key, table)?;
            _globals.set(key, readonly_table)?;
        }
    }

    lua.set_globals(_globals)?;
    log::debug!("LUA runtime configured successfully");

    return LUA_RUNTIME.set(Arc::new(lua)).map_err(|_| Error::OnceLockAlreadyInitialized(LUA_RUNTIME_ONCE_LOCK_KEY));
}

fn create_lua_env(manifest: &Arc<PluginManifest>) -> Result<(), Error> {
    let lua = LUA_RUNTIME.get().ok_or(Error::OnceLockNotInitialized(LUA_RUNTIME_ONCE_LOCK_KEY))?;

    let plugin_env = lua.create_table()?;

    /* ========================================================================================== */

    let mt = lua.create_table()?;
    let mut protected_keys: HashSet<String> = HashSet::new();
    for pair in lua.globals().pairs::<mlua::Value, mlua::Value>() {
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
            } else if matches!(k.as_ref(), PLUGIN_NAME_KEY | PLUGIN_VERSION_KEY | UNICHAT_API_KEY | UNICHAT_PLATFORM_KEY | UNICHAT_AUTHOR_TYPE_KEY | UNICHAT_EVENT_KEY | "print" | "require") {
                return Err(mlua::Error::runtime(format!("Immutable table: cannot modify protected key '{}'", k)));
            }
        }

        table.raw_set(key, value)?;
        return Ok(());
    })?;
    mt.set("__newindex", newindex_func)?;
    mt.set("__index", lua.globals())?;
    mt.set("__metatable", mlua::Value::Boolean(false))?;
    plugin_env.set_metatable(Some(mt))?;

    /* <==========================================[ LUA Standard Library ]==========================================> */
    let plugin_name = manifest.name.clone();
    let print_func = lua.create_function(move |lua, args: mlua::Variadic<mlua::Value>| {
        let mut output_parts: Vec<String> = Vec::new();

        for arg in args.into_iter() {
            if let Some(arg_str) = lua.coerce_string(arg)? {
                let str = arg_str.to_string_lossy();
                output_parts.push(str);
            } else {
                output_parts.push(String::from("<non-stringifiable>"));
            }
        }

        let output = output_parts.join("\t");
        log::info!(target: &format!("plugin:{}", plugin_name), "{}", output);
        return Ok(());
    })?;
    plugin_env.raw_set("print", print_func)?;

    let plugin_env_clone = plugin_env.clone();
    let plugin_name = manifest.name.clone();
    let require_func = lua.create_function(move |lua, module: String| -> mlua::Result<mlua::Value> {
        if module == "unichat:json" {
            return unichat_json::create_module(lua);
        } else if module == "unichat:logger" {
            return unichat_logger::create_module(lua, &plugin_name);
        } else if module == "unichat:time" {
            return unichat_time::create_module(lua);
        }

        let manifest = get_loaded_plugin_manifest(&plugin_name)?;
        let plugin_root = manifest.plugin_path.join("data");
        let mut module_path = module.replace('.', "/");
        if !module_path.ends_with(".lua") {
            module_path.push_str(".lua");
        }

        let path = safe_guard_path(&plugin_root, &module_path).map_err(|e| mlua::Error::runtime(e))?;
        let code = fs::read_to_string(path).map_err(|e| mlua::Error::external(e))?;
        let result: mlua::Value = lua.load(&code).set_environment(plugin_env_clone.clone()).eval()?;

        return Ok(result);
    })?;
    plugin_env.raw_set("require", require_func)?;
    /* <========================================[ End LUA Standard Library ]========================================> */

    /* <========================================[ UniChat Standard Library ]========================================> */
    plugin_env.raw_set(PLUGIN_NAME_KEY, manifest.name.as_str())?;
    plugin_env.raw_set(PLUGIN_VERSION_KEY, manifest.version.as_str())?;
    plugin_env.raw_set(UNICHAT_API_KEY, UniChatAPI::new(manifest.name.clone()))?;
    plugin_env.raw_set(UNICHAT_PLATFORM_KEY, LuaUniChatPlatform)?;
    plugin_env.raw_set(UNICHAT_AUTHOR_TYPE_KEY, LuaUniChatAuthorType)?;
    plugin_env.raw_set(UNICHAT_EVENT_KEY, LuaUniChatEvent)?;
    /* <======================================[ End UniChat Standard Library ]======================================> */

    log::info!("Executing plugin entrypoint for plugin: {} v{}", manifest.name, manifest.version);
    let entrypoint_path = manifest.plugin_path.join("data").join("main.lua");
    let entrypoint_code = fs::read_to_string(entrypoint_path)?;
    lua.load(&entrypoint_code).set_environment(plugin_env).exec()?;

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

fn parse_dependencies(versions: Option<Vec<String>>) -> Result<Vec<(String, semver::VersionReq)>, Error> {
    let mut dependencies: Vec<(String, semver::VersionReq)> = Vec::new();

    if let Some(versions) = versions {
        for dep in versions {
            let parts: Vec<&str> = dep.splitn(2, '@').collect();
            if parts.len() != 2 {
                return Err(Error::Message(format!("Invalid dependency format: '{}'. Expected format is 'name@version_req'", dep)));
            }

            let name = parts[0].trim().to_string();
            let version = parts[1].trim();
            let version_req = parse_dependency_version(version)?;

            dependencies.push((name, version_req));
        }
    }

    return Ok(dependencies);
}

fn load_plugin(plugin_path: path::PathBuf) -> Result<(), Error> {
    let manifest_path = plugin_path.join("manifest.yaml");
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

    let parsed_dependencies = parse_dependencies(manifest.dependencies)?;
    for (key, version_req) in parsed_dependencies.iter() {
        if key == "unichat" {
            let unichat_version = semver::Version::parse(CARGO_PKG_VERSION)?;
            if !version_req.matches(&unichat_version) {
                return Err(Error::Message(format!("Plugin '{}' requires unichat version '{}' which does not satisfy the current version '{}'", manifest.name, version_req, unichat_version)));
            }
        }
    }

    let manifest = Arc::new(PluginManifest {
        name: manifest.name,
        description: manifest.description,
        version: manifest.version,
        author: manifest.author,
        license: manifest.license,
        homepage: manifest.homepage,
        dependencies: parsed_dependencies,
        plugin_path: plugin_path.clone()
    });

    log::info!("Loading plugin: {} v{}", manifest.name, manifest.version);
    {
        let mut loaded_plugins = LOADED_PLUGINS.write().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;
        if loaded_plugins.contains_key(&manifest.name) {
            return Err(Error::Message(format!("Plugin with name '{}' is already loaded", manifest.name)));
        }

        loaded_plugins.insert(manifest.name.clone(), manifest.clone());
    }

    if let Err(e) = create_lua_env(&manifest) {
        let mut loaded_plugins = LOADED_PLUGINS.write().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;
        loaded_plugins.remove(&manifest.name);
        return Err(Error::Message(format!("Failed to load plugin '{}': {}", manifest.name, e)));
    }

    log::info!("Loaded plugin: {} v{}", manifest.name, manifest.version);

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
