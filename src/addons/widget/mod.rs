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
use crate::widgets::reload_user_widgets;

/* ========================================================================== */

const COMMUNITY_WIDGETS_PATH: &str = "/community-widgets";
const COMMUNITY_WIDGETS_FILE_TTL: Duration = Duration::from_secs(60 * 60);
const COMMUNITY_WIDGET_ID_PREFIX: &str = "unichat-widget-";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommunityWidget {
    #[serde(flatten)]
    addon: CommunityAddon,
    preview_url: String
}

/* ========================================================================== */

fn fetch_all() -> Result<Vec<CommunityAddonData>, Error> {
    return cache::get_or_fetch("community_widgets", COMMUNITY_WIDGETS_FILE_TTL, || api::get(COMMUNITY_WIDGETS_PATH));
}

fn fetch(internal_id: &str) -> Result<CommunityAddonData, Error> {
    let path = format!("{}/{}", COMMUNITY_WIDGETS_PATH, internal_id);
    let key = format!("community_widget_{}", internal_id.replace(':', "_"));

    return cache::get_or_fetch(&key, COMMUNITY_WIDGETS_FILE_TTL, || api::get(&path));
}

fn build(data: CommunityAddonData, installed_version: Option<String>) -> CommunityWidget {
    let id = community_addon_id(&data.id, COMMUNITY_WIDGET_ID_PREFIX);
    let preview_url = api::url(&format!("{}/{}/preview", COMMUNITY_WIDGETS_PATH, data.id));
    let releases = data.releases.clone().unwrap_or_default();

    return CommunityWidget {
        addon: build_community_addon(data, id, installed_version, &releases),
        preview_url: preview_url
    };
}

/* ========================================================================== */

pub fn list() -> Result<Vec<CommunityWidget>, Error> {
    let items = fetch_all()?;
    let widgets_path = properties::get_app_path(AppPaths::UniChatUserWidgets);

    let mut community_widgets = Vec::new();
    for item in items {
        let id = community_addon_id(&item.id, COMMUNITY_WIDGET_ID_PREFIX);
        let installed_version = find_installed_version(&widgets_path, &id);

        let mut data = item;
        if installed_version.is_some() {
            data = fetch(&data.id)?;
        }

        community_widgets.push(build(data, installed_version));
    }

    return Ok(community_widgets);
}

pub fn get(internal_id: &str) -> Result<CommunityWidget, Error> {
    let data = fetch(internal_id)?;
    let id = community_addon_id(&data.id, COMMUNITY_WIDGET_ID_PREFIX);
    let widgets_path = properties::get_app_path(AppPaths::UniChatUserWidgets);
    let installed_version = find_installed_version(&widgets_path, &id);

    return Ok(build(data, installed_version));
}

pub fn install(internal_id: &str, release: &str) -> Result<(), Error> {
    let data = fetch(internal_id)?;
    let id = community_addon_id(&data.id, COMMUNITY_WIDGET_ID_PREFIX);
    let selected = find_release(&data, release)?;
    check_compatibility(&data, selected)?;

    let (extract_path, extracted_widget_path) = download_release(&id, selected)?;
    let widget_path = properties::get_app_path(AppPaths::UniChatUserWidgets).join(&id);
    replace_addon(&extracted_widget_path, &widget_path, &[PathBuf::from("fieldstate.json")])?;

    fs::remove_dir_all(&extract_path).map_err(|e| anyhow!("Failed to clean '{:?}': {:#?}", extract_path, e))?;
    reload_user_widgets()?;
    log::info!("Installed community widget '{}' version '{}'", id, release);

    return Ok(());
}
