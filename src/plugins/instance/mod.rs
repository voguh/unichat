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
use crate::addons::UniChatAddonManifest;
use crate::plugins;
use crate::plugins::PluginMetadata;
use crate::plugins::PluginStatus;
use crate::plugins::runtime;
use crate::utils::get_current_timestamp;
use crate::widgets;

mod env;

/* ========================================================================== */

fn start(plugin: &Arc<PluginMetadata>) -> Result<(), Error> {
    let lua = runtime::get();
    let plugin_env = plugin.get_plugin_env();
    env::load_env(&plugin.id, &plugin.version, plugin_env.clone())?;

    /* ====================================================================== */

    let start_ms = get_current_timestamp();
    log::info!("Executing plugin entrypoint for plugin: {} v{}", plugin.id, plugin.version);
    let entrypoint_code = fs::read_to_string(plugin.get_entrypoint_path())?;
    let chunk_name = format!("{}/main.lua", plugin.id);
    lua.load(&entrypoint_code).set_name(chunk_name).set_environment(plugin_env).exec()?;
    let end_ms = get_current_timestamp();
    log::info!("Plugin '{}' initialized in {} ms", plugin.id, end_ms - start_ms);
    plugin.add_message(format!("Initialization finished in {}ms", end_ms - start_ms));

    return Ok(());
}

/* ========================================================================== */

pub fn create(plugin_path: &Path, manifest: &UniChatAddonManifest) -> Result<(), Error> {
    let plugin = PluginMetadata::new(plugin_path, manifest)?;
    let plugin = Arc::new(plugin);
    let mut is_valid = true;

    if !plugin.get_entrypoint_path().is_file() {
        plugin.add_message(format!("Plugin '{:?}' is missing required 'data/main.lua'", plugin_path));
        is_valid = false;
    }

    if let Some(version_req) = plugin.dependencies.get("unichat") {
        if !version_req.matches(&UNICHAT_VERSION) {
            let msg = format!("{} required '{}', found '{}'", UNICHAT_DISPLAY_NAME, version_req, *UNICHAT_VERSION);
            plugin.add_message(msg);
            is_valid = false;
        }
    }

    plugins::write(plugin.clone())?;

    if !is_valid {
        plugin.set_status(PluginStatus::Invalid);
        return Err(anyhow!("Invalid plugin '{}'", plugin.id));
    }

    log::info!("Plugin '{}' loaded", plugin.id);

    if let Err(e) = widgets::add_plugin_widgets(&plugin) {
        plugin.add_message(format!("An error occurred while loading plugin widgets: {:#?}", e));
        log::error!("Failed to load widgets for plugin '{}': {:#?}", plugin.id, e);
    }

    if let Err(e) = start(&plugin) {
        plugin.add_message(format!("An error occurred on start plugin: {:#?}", e));
        plugin.set_status(PluginStatus::Error);
        return Err(anyhow!("Failed to start plugin '{}': {:#?}", plugin.id, e));
    }

    plugin.set_status(PluginStatus::Active);
    log::info!("Plugin '{}' loaded successfully", plugin.id);

    return Ok(());
}
