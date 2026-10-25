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
use std::path::Path;
use std::path::PathBuf;

use anyhow::Error;
use anyhow::anyhow;
use serde::Deserialize;
use serde::Serialize;
use sha2::Digest;
use sha2::Sha256;
use zip::ZipArchive;

use crate::UNICHAT_VERSION;
use crate::addons::manifest::load_manifest;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::semver;
use crate::utils::semver::version::Version;
use crate::utils::semver::version_range::VersionRange;
use crate::utils::ureq;

pub mod community_plugin;
pub mod community_widget;
pub mod manifest;

/* ========================================================================== */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AddonReleaseAsset {
    pub id: u64,
    pub name: String,
    pub size: u64,
    pub digest: String,
    pub url: String,
    pub download_count: u64,
    pub created_at: String
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AddonRelease {
    pub id: u64,
    pub name: String,
    pub description: String,
    pub url: String,
    pub prerelease: bool,
    pub source_url: String,
    pub assets: Vec<AddonReleaseAsset>,
    pub created_at: String,
    pub published_at: String
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CommunityAddonData {
    pub id: String,
    pub name: String,
    pub short_description: String,
    pub description: String,
    pub version: String,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage_url: Option<String>,
    pub repository_url: String,
    #[serde(rename = "requiresUniChat")]
    pub requires_unichat: Option<String>,
    pub stars: Option<u64>,
    pub updated_at: Option<String>,
    pub releases: Option<Vec<AddonRelease>>
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommunityAddon {
    internal_id: String,
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
    releases: Option<Vec<AddonRelease>>,

    installed_version: Option<String>,
    compatible: bool,
    has_update: bool
}

/* ========================================================================== */

pub fn is_compatible(requires_unichat: &Option<String>) -> bool {
    if let Some(requires_unichat) = requires_unichat {
        let unichat_version = Version::parse(UNICHAT_VERSION).expect("UNICHAT_VERSION is not a valid version");
        match VersionRange::parse(requires_unichat) {
            Ok(range) => return range.matches(&unichat_version),
            Err(e) => {
                log::warn!("Invalid UniChat version range '{}': {:#?}", requires_unichat, e);
                return false;
            }
        }
    }

    return true;
}

pub fn has_update(installed_version: &str, releases: &[AddonRelease]) -> bool {
    let mut installed_is_prerelease = false;
    if let Ok(version) = Version::parse(installed_version) {
        installed_is_prerelease = version.pre_release().is_some();
    }

    for release in releases {
        if release.prerelease && !installed_is_prerelease {
            continue;
        }

        if semver::gt(&release.name, installed_version) {
            return true;
        }
    }

    return false;
}

/* ========================================================================== */

pub fn community_addon_id(internal_id: &str, prefix: &str) -> String {
    let repository = internal_id.rsplit(':').next().unwrap_or(internal_id);

    return repository.strip_prefix(prefix).unwrap_or(repository).to_string();
}

pub fn find_installed_version(addons_path: &Path, id: &str) -> Option<String> {
    let addon_path = addons_path.join(id);
    if !addon_path.join("manifest.yaml").is_file() {
        return None;
    }

    match load_manifest(&addon_path) {
        Ok(manifest) => return Some(manifest.version),
        Err(e) => {
            log::warn!("Failed to read manifest of installed addon '{}': {:#?}", id, e);
            return None;
        }
    }
}

pub fn build_community_addon(
    data: CommunityAddonData,
    id: String,
    installed_version: Option<String>,
    releases: &[AddonRelease]
) -> CommunityAddon {
    let compatible = is_compatible(&data.requires_unichat);

    let mut update_available = false;
    if let Some(installed_version) = &installed_version {
        update_available = has_update(installed_version, releases);
    }

    return CommunityAddon {
        internal_id: data.id,
        id: id,
        name: data.name,
        short_description: data.short_description,
        description: data.description,
        version: data.version,
        author: data.author,
        license: data.license,
        homepage_url: data.homepage_url,
        repository_url: data.repository_url,
        requires_unichat: data.requires_unichat,
        stars: data.stars,
        updated_at: data.updated_at,
        releases: data.releases,

        installed_version: installed_version,
        compatible: compatible,
        has_update: update_available
    };
}

/* ========================================================================== */

pub fn find_release<'a>(data: &'a CommunityAddonData, release: &str) -> Result<&'a AddonRelease, Error> {
    let releases = data.releases.as_deref().unwrap_or_default();
    let selected = releases.iter().find(|r| r.name == release);

    return selected.ok_or(anyhow!("Release '{}' not found for '{}'", release, data.name));
}

pub fn check_compatibility(data: &CommunityAddonData, release: &AddonRelease) -> Result<(), Error> {
    if release.name == data.version && !is_compatible(&data.requires_unichat) {
        let requires_unichat = data.requires_unichat.clone().unwrap_or_default();
        return Err(anyhow!("'{}' {} requires UniChat {}", data.name, release.name, requires_unichat));
    }

    return Ok(());
}

fn download_release_asset(asset: &AddonReleaseAsset) -> Result<Vec<u8>, Error> {
    log::info!("Downloading '{}' from '{}'...", asset.name, asset.url);
    let mut response = ureq::get(&asset.url).call()?;
    let bytes = response.body_mut().read_to_vec()?;

    let expected = asset.digest.trim_start_matches("sha256:");
    let actual = format!("{:x}", Sha256::digest(&bytes));
    if actual != expected {
        return Err(anyhow!("Digest mismatch for asset '{}': expected '{}', got '{}'", asset.name, expected, actual));
    }

    return Ok(bytes);
}

pub fn download_release(id: &str, release: &AddonRelease) -> Result<(PathBuf, PathBuf), Error> {
    let asset_name = format!("{}-{}.zip", id, release.name);
    let asset = release.assets.iter().find(|a| a.name == asset_name);
    let asset = asset.ok_or(anyhow!("Release '{}' of '{}' has no asset '{}'", release.name, id, asset_name))?;
    let bytes = download_release_asset(asset)?;

    let extract_path = properties::get_app_path(AppPaths::AppCache).join(format!("install_{}", id));
    if extract_path.exists() {
        fs::remove_dir_all(&extract_path).map_err(|e| anyhow!("Failed to clean '{:?}': {:#?}", extract_path, e))?;
    }

    let cursor = Cursor::new(bytes);
    let mut file = ZipArchive::new(cursor).map_err(|e| anyhow!("Failed to open asset '{}': {:#?}", asset.name, e))?;
    file.extract(&extract_path).map_err(|e| anyhow!("Failed to extract asset '{}': {:#?}", asset.name, e))?;

    let addon_path = extract_path.join(id);
    if !addon_path.is_dir() {
        return Err(anyhow!("Asset '{}' does not contain a '{}' folder", asset.name, id));
    }

    return Ok((extract_path, addon_path));
}

/* ========================================================================== */

fn copy_recursively(from: &Path, to: &Path) -> Result<(), Error> {
    if from.is_file() {
        fs::copy(from, to).map_err(|e| anyhow!("Failed to copy '{:?}' to '{:?}': {:#?}", from, to, e))?;
        return Ok(());
    }

    fs::create_dir_all(to).map_err(|e| anyhow!("Failed to create '{:?}': {:#?}", to, e))?;
    let entries = fs::read_dir(from).map_err(|e| anyhow!("Failed to read '{:?}': {:#?}", from, e))?;
    for entry in entries.flatten() {
        copy_recursively(&entry.path(), &to.join(entry.file_name()))?;
    }

    return Ok(());
}

pub fn replace_addon(src: &Path, dest: &Path, keep_list: &[PathBuf]) -> Result<(), Error> {
    if dest.exists() {
        for relative_path in keep_list {
            let from = dest.join(relative_path);
            let to = src.join(relative_path);
            let target_parent_exists = to.parent().is_some_and(|parent| parent.is_dir());
            if from.exists() && target_parent_exists {
                copy_recursively(&from, &to)?;
            }
        }

        fs::remove_dir_all(dest).map_err(|e| anyhow!("Failed to remove '{:?}': {:#?}", dest, e))?;
    }

    if let Err(e) = fs::rename(src, dest) {
        return Err(anyhow!("Failed to move '{:?}' to '{:?}': {:#?}", src, dest, e));
    }

    return Ok(());
}
