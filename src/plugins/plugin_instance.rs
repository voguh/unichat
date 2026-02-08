/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::path::Path;
use std::sync::Arc;

use anyhow::anyhow;
use anyhow::Error;

use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_VERSION;
use crate::plugins::LOADED_PLUGINS;
use crate::plugins::LOADED_PLUGINS_LAZY_LOCK_KEY;
use crate::plugins::PluginStatus;
use crate::plugins::UniChatPlugin;
use crate::plugins::lua_env::load_plugin_env;
use crate::plugins::plugin_manifest::PluginManifestYAML;
use crate::plugins::utils::parse_dependencies;
use crate::utils::semver;
use crate::widgets;

pub fn load_plugin(plugin_path: &Path, manifest: &PluginManifestYAML) -> Result<(), Error> {
    let parsed_dependencies = parse_dependencies(&manifest.dependencies)?;
    let plugin = UniChatPlugin::new(plugin_path, &manifest, parsed_dependencies)?;
    let plugin = Arc::new(plugin);
    let mut has_error = false;

    if !plugin.get_data_path().is_dir() {
        plugin.add_message(format!("Plugin folder '{:?}' is missing required 'data' directory", plugin_path));
        plugin.set_status(PluginStatus::Error);
        has_error = true;
    } else if !plugin.get_entrypoint_path().is_file() {
        plugin.add_message(format!("Plugin folder '{:?}' is missing required 'data/main.lua' entrypoint file", plugin_path));
        plugin.set_status(PluginStatus::Error);
        has_error = true;
    }

    for (key, version_req) in plugin.dependencies.iter() {
        if key == "unichat" {
            let unichat_version = semver::Version::parse(UNICHAT_VERSION)?;
            if !version_req.matches(&unichat_version) {
                plugin.add_message(format!("Required {} version '{}' does not satisfy the current version '{}'", UNICHAT_DISPLAY_NAME, version_req, unichat_version));
                plugin.set_status(PluginStatus::Error);
                has_error = true;
            }
        }
    }

    {
        let mut loaded_plugins = LOADED_PLUGINS.write().map_err(|_| anyhow!("{} lock poisoned", LOADED_PLUGINS_LAZY_LOCK_KEY))?;
        if loaded_plugins.contains_key(&plugin.name) {
            return Err(anyhow!("Plugin with name '{}' is already loaded", plugin.name));
        }

        loaded_plugins.insert(plugin.name.clone(), plugin.clone());

        if has_error {
            plugin.set_status(PluginStatus::Invalid);
            return Err(anyhow!("Plugin '{}' initialization failed due to previous errors", plugin.name));
        } else {
            plugin.set_status(PluginStatus::Loaded);
            log::info!("Plugin '{}' loaded", plugin.name);
        }
    }

    if let Err(e) = widgets::add_plugin_widgets(&plugin) {
        plugin.add_message(format!("An error occurred while loading plugin widgets: {:?}", e));
        log::error!("Failed to load widgets for plugin '{}': {:?}", plugin.name, e);
    }

    if let Err(e) = load_plugin_env(&plugin) {
        plugin.add_message(format!("An error occurred on start plugin: {:?}", e));
        plugin.set_status(PluginStatus::Error);
        return Err(anyhow!("Failed to create LUA environment for plugin '{}': {:?}", plugin.name, e));
    }

    plugin.set_status(PluginStatus::Active);
    log::info!("Plugin '{}' loaded successfully", plugin.name);

    return Ok(());
}
