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
use std::path::Path;
use std::sync::Arc;

use anyhow::Error;
use anyhow::anyhow;

use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_VERSION;
use crate::addons::manifest::UniChatAddonManifest;
use crate::plugins;
use crate::plugins::PluginStatus;
use crate::plugins::UniChatPlugin;
use crate::plugins::runtime;
use crate::utils::get_current_timestamp;
use crate::utils::semver::version::Version;
use crate::utils::semver::version_range::VersionRange;
use crate::widgets;

mod env;

/* ========================================================================== */

fn parse_dependencies(raw_dependencies: &Vec<String>) -> Result<Vec<(String, VersionRange)>, Error> {
    let mut dependencies: Vec<(String, VersionRange)> = Vec::new();

    for dep in raw_dependencies {
        let parts: Vec<&str> = dep.splitn(2, '@').collect();
        if parts.len() != 2 {
            return Err(anyhow!("Invalid dependency '{}'", dep));
        }

        let name = parts[0].trim().to_string();
        let version = parts[1].trim();
        let version_req = VersionRange::parse(version)?;

        dependencies.push((name, version_req));
    }

    return Ok(dependencies);
}

/* ========================================================================== */

fn start(plugin: &Arc<UniChatPlugin>) -> Result<(), Error> {
    let lua = runtime::get();
    let plugin_env = plugin.get_plugin_env();
    env::load_env(&plugin.name, &plugin.version, plugin_env.clone())?;

    /* ====================================================================== */

    let start_ms = get_current_timestamp();
    log::info!("Executing plugin entrypoint for plugin: {} v{}", plugin.name, plugin.version);
    let entrypoint_code = fs::read_to_string(plugin.get_entrypoint_path())?;
    lua.load(&entrypoint_code).set_environment(plugin_env.clone()).exec()?;
    let end_ms = get_current_timestamp();
    log::info!("Plugin '{}' initialized in {} ms", plugin.name, end_ms - start_ms);
    plugin.add_message(format!("Initialization finished in {}ms", end_ms - start_ms));

    return Ok(());
}

/* ========================================================================== */

pub fn create(plugin_path: &Path, manifest: &UniChatAddonManifest) -> Result<(), Error> {
    let parsed_dependencies = parse_dependencies(&manifest.dependencies)?;
    let plugin = UniChatPlugin::new(plugin_path, manifest, parsed_dependencies)?;
    let plugin = Arc::new(plugin);
    let mut is_valid = true;

    if !plugin.get_entrypoint_path().is_file() {
        plugin.add_message(format!("Plugin '{:?}' is missing required 'data/main.lua'", plugin_path));
        is_valid = false;
    }

    for (key, version_req) in plugin.dependencies.iter() {
        if key == "unichat" {
            let version = Version::parse(UNICHAT_VERSION).expect("UNICHAT_VERSION is not a valid version");
            if !version_req.matches(&version) {
                let msg = format!("{} required '{}', found '{}'", UNICHAT_DISPLAY_NAME, version_req, version);
                plugin.add_message(msg);
                is_valid = false;
            }
        }
    }

    plugins::write(plugin.clone())?;

    if !is_valid {
        plugin.set_status(PluginStatus::Invalid);
        return Err(anyhow!("Invalid plugin '{}'", plugin.name));
    }

    plugin.set_status(PluginStatus::Loaded);
    log::info!("Plugin '{}' loaded", plugin.name);

    if let Err(e) = widgets::add_plugin_widgets(&plugin) {
        plugin.add_message(format!("An error occurred while loading plugin widgets: {:#?}", e));
        log::error!("Failed to load widgets for plugin '{}': {:#?}", plugin.name, e);
    }

    if let Err(e) = start(&plugin) {
        plugin.add_message(format!("An error occurred on start plugin: {:#?}", e));
        plugin.set_status(PluginStatus::Error);
        return Err(anyhow!("Failed to create LUA environment for plugin '{}': {:#?}", plugin.name, e));
    }

    plugin.set_status(PluginStatus::Active);
    log::info!("Plugin '{}' loaded successfully", plugin.name);

    return Ok(());
}
