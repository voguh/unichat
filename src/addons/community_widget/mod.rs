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
use std::io::Cursor;
use std::time::Duration;

use anyhow::anyhow;
use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;
use zip::ZipArchive;

use crate::addons::AddonRelease;
use crate::addons::download_release_asset;
use crate::addons::has_update;
use crate::addons::is_compatible;
use crate::api;
use crate::cache;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::widgets;
use crate::widgets::WidgetMetadata;
use crate::widgets::WidgetSource;
use crate::widgets::reload_user_widgets;

/* ========================================================================== */

const COMMUNITY_WIDGETS_PATH: &str = "/v2/community-widgets";
const COMMUNITY_WIDGETS_FILE_TTL: Duration = Duration::from_secs(60 * 60);

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
struct CommunityWidgetData {
    id: String,
    name: String,
    short_description: String,
    description: String,
    version: String,
    author: Option<String>,
    license: Option<String>,
    homepage_url: Option<String>,
    repository_url: String,
    #[serde(rename = "requiresUniChat")]
    requires_unichat: Option<String>,
    stars: Option<u64>,
    updated_at: Option<String>,
    releases: Option<Vec<AddonRelease>>
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommunityWidget {
    #[serde(flatten)]
    data: CommunityWidgetData,
    preview_url: String,
    installed_version: Option<String>,
    compatible: bool,
    has_update: bool,
    warnings: Vec<String>
}

/* ========================================================================== */

fn fetch_all() -> Result<Vec<CommunityWidgetData>, Error> {
    return cache::get_or_fetch("community_widgets", COMMUNITY_WIDGETS_FILE_TTL, || api::get(COMMUNITY_WIDGETS_PATH));
}

fn fetch(id: &str) -> Result<CommunityWidgetData, Error> {
    let path = format!("{}/{}", COMMUNITY_WIDGETS_PATH, id);
    let key = format!("community_widget_{}", id.replace(':', "_"));

    return cache::get_or_fetch(&key, COMMUNITY_WIDGETS_FILE_TTL, || api::get(&path));
}

fn find_local_widget(name: &str) -> Option<WidgetMetadata> {
    let local_widgets = widgets::get_widgets();
    let local_widget = local_widgets.into_iter().find(|w| w.widget_source == WidgetSource::User && w.name == name);

    return local_widget;
}

fn build(data: CommunityWidgetData, local_widget: Option<WidgetMetadata>, releases: &[AddonRelease]) -> CommunityWidget {
    let compatible = is_compatible(&data.requires_unichat);
    let preview_url = api::url(&format!("{}/{}/preview", COMMUNITY_WIDGETS_PATH, data.id));
    let mut installed_version = None;
    let mut update_available = false;
    let mut warnings = Vec::new();

    if let Some(local_widget) = local_widget {
        update_available = has_update(&local_widget.version, releases);
        warnings = local_widget.warnings;
        installed_version = Some(local_widget.version);
    }

    return CommunityWidget {
        data: data,
        preview_url: preview_url,
        installed_version: installed_version,
        compatible: compatible,
        has_update: update_available,
        warnings: warnings
    };
}

/* ========================================================================== */

pub fn list() -> Result<Vec<CommunityWidget>, Error> {
    let items = fetch_all()?;

    let mut community_widgets = Vec::new();
    for item in items {
        let local_widget = find_local_widget(&item.name);

        let mut releases = Vec::new();
        if local_widget.is_some() {
            let detail = fetch(&item.id)?;
            releases = detail.releases.unwrap_or_default();
        }

        let community_widget = build(item, local_widget, &releases);
        community_widgets.push(community_widget);
    }

    return Ok(community_widgets);
}

pub fn get(id: &str) -> Result<CommunityWidget, Error> {
    let data = fetch(id)?;
    let releases = data.releases.clone().unwrap_or_default();
    let local_widget = find_local_widget(&data.name);

    return Ok(build(data, local_widget, &releases));
}

pub fn install(id: &str, release: &str) -> Result<(), Error> {
    let data = fetch(id)?;
    let releases = data.releases.clone().unwrap_or_default();
    let selected_release = releases.iter().find(|r| r.name == release).ok_or(anyhow!("Release '{}' not found for widget '{}'", release, data.name))?;

    let compatible = is_compatible(&data.requires_unichat);
    if selected_release.name == data.version && !compatible {
        return Err(anyhow!("Widget '{}' {} requires UniChat {}", data.name, release, data.requires_unichat.unwrap_or_default()));
    }

    let asset = selected_release.assets.iter().find(|a| a.name.ends_with(".zip")).ok_or(anyhow!("Release '{}' of widget '{}' has no zip asset", release, data.name))?;
    let bytes = download_release_asset(asset)?;

    /* ====================================================================== */

    let extract_path = properties::get_app_path(AppPaths::AppCache).join(format!("install_{}", data.name));
    if extract_path.exists() {
        fs::remove_dir_all(&extract_path).map_err(|e| anyhow!("Failed to clean '{:?}': {:#?}", extract_path, e))?;
    }

    let mut archive = ZipArchive::new(Cursor::new(bytes)).map_err(|e| anyhow!("Failed to open asset '{}': {:#?}", asset.name, e))?;
    archive.extract(&extract_path).map_err(|e| anyhow!("Failed to extract asset '{}': {:#?}", asset.name, e))?;

    let extracted_widget_path = extract_path.join(&data.name);
    if !extracted_widget_path.is_dir() {
        return Err(anyhow!("Asset '{}' does not contain a '{}' folder", asset.name, data.name));
    }

    /* ====================================================================== */

    let widget_path = properties::get_app_path(AppPaths::UniChatUserWidgets).join(&data.name);
    if widget_path.exists() {
        let fieldstate_path = widget_path.join("fieldstate.json");
        if fieldstate_path.is_file() {
            let target_fieldstate_path = extracted_widget_path.join("fieldstate.json");
            fs::copy(&fieldstate_path, &target_fieldstate_path).map_err(|e| anyhow!("Failed to copy '{:?}' to '{:?}': {:#?}", fieldstate_path, target_fieldstate_path, e))?;
        }

        fs::remove_dir_all(&widget_path).map_err(|e| anyhow!("Failed to remove '{:?}': {:#?}", widget_path, e))?;
    }

    fs::rename(&extracted_widget_path, &widget_path).map_err(|e| anyhow!("Failed to move '{:?}' to '{:?}': {:#?}", extracted_widget_path, widget_path, e))?;
    fs::remove_dir_all(&extract_path).map_err(|e| anyhow!("Failed to clean '{:?}': {:#?}", extract_path, e))?;
    reload_user_widgets()?;
    log::info!("Installed community widget '{}' version '{}'", data.name, release);

    return Ok(());
}
