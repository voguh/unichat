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
use std::path::PathBuf;
use std::time::Duration;

use anyhow::Error;
use anyhow::anyhow;
use serde::Serialize;

use crate::addons::CommunityAddon;
use crate::addons::CommunityAddonData;
use crate::addons::build_community_addon;
use crate::addons::check_compatibility;
use crate::addons::community_addon_id;
use crate::addons::download_release;
use crate::addons::find_installed_version;
use crate::addons::find_release;
use crate::addons::replace_addon;
use crate::api;
use crate::cache;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

/* ========================================================================== */

const COMMUNITY_PLUGINS_PATH: &str = "/v1/community-plugins";
const COMMUNITY_PLUGINS_FILE_TTL: Duration = Duration::from_secs(60 * 60);
const COMMUNITY_PLUGIN_ID_PREFIX: &str = "unichat-";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommunityPlugin {
    #[serde(flatten)]
    addon: CommunityAddon,
    icon_url: String
}

/* ========================================================================== */

fn fetch_all() -> Result<Vec<CommunityAddonData>, Error> {
    return cache::get_or_fetch("community_plugins", COMMUNITY_PLUGINS_FILE_TTL, || api::get(COMMUNITY_PLUGINS_PATH));
}

fn fetch(internal_id: &str) -> Result<CommunityAddonData, Error> {
    let path = format!("{}/{}", COMMUNITY_PLUGINS_PATH, internal_id);
    let key = format!("community_plugin_{}", internal_id.replace(':', "_"));

    return cache::get_or_fetch(&key, COMMUNITY_PLUGINS_FILE_TTL, || api::get(&path));
}

fn build(data: CommunityAddonData, installed_version: Option<String>) -> CommunityPlugin {
    let id = community_addon_id(&data.id, COMMUNITY_PLUGIN_ID_PREFIX);
    let icon_url = api::url(&format!("{}/{}/icon", COMMUNITY_PLUGINS_PATH, data.id));
    let releases = data.releases.clone().unwrap_or_default();

    return CommunityPlugin {
        addon: build_community_addon(data, id, installed_version, &releases),
        icon_url: icon_url
    };
}

fn widget_fieldstates(plugin_path: &Path) -> Vec<PathBuf> {
    let mut keep_list = Vec::new();
    if let Ok(entries) = fs::read_dir(plugin_path.join("widgets")) {
        for entry in entries.flatten() {
            keep_list.push(PathBuf::from("widgets").join(entry.file_name()).join("fieldstate.json"));
        }
    }

    return keep_list;
}

/* ========================================================================== */

pub fn list() -> Result<Vec<CommunityPlugin>, Error> {
    let items = fetch_all()?;
    let plugins_path = properties::get_app_path(AppPaths::UniChatUserPlugins);

    let mut community_plugins = Vec::new();
    for item in items {
        let id = community_addon_id(&item.id, COMMUNITY_PLUGIN_ID_PREFIX);
        let installed_version = find_installed_version(&plugins_path, &id);

        let mut data = item;
        if installed_version.is_some() {
            data = fetch(&data.id)?;
        }

        community_plugins.push(build(data, installed_version));
    }

    return Ok(community_plugins);
}

pub fn get(internal_id: &str) -> Result<CommunityPlugin, Error> {
    let data = fetch(internal_id)?;
    let id = community_addon_id(&data.id, COMMUNITY_PLUGIN_ID_PREFIX);
    let plugins_path = properties::get_app_path(AppPaths::UniChatUserPlugins);
    let installed_version = find_installed_version(&plugins_path, &id);

    return Ok(build(data, installed_version));
}

pub fn install(internal_id: &str, release: &str) -> Result<(), Error> {
    let data = fetch(internal_id)?;
    let id = community_addon_id(&data.id, COMMUNITY_PLUGIN_ID_PREFIX);
    let selected = find_release(&data, release)?;
    check_compatibility(&data, selected)?;

    let (extract_path, extracted_plugin_path) = download_release(&id, selected)?;
    let plugin_path = properties::get_app_path(AppPaths::UniChatUserPlugins).join(&id);
    replace_addon(&extracted_plugin_path, &plugin_path, &widget_fieldstates(&plugin_path))?;

    fs::remove_dir_all(&extract_path).map_err(|e| anyhow!("Failed to clean '{:?}': {:#?}", extract_path, e))?;
    log::info!("Installed community plugin '{}' version '{}'", id, release);

    return Ok(());
}
