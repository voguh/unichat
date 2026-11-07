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
use crate::utils::paths;
use crate::utils::paths::AppPaths;
use crate::utils::semver::Version;
use crate::utils::semver::VersionRange;
use crate::utils::ureq;

mod manifest;
pub mod plugin;
pub mod widget;

/* ========================================================================== */

pub use manifest::UniChatAddonManifest;
pub use manifest::is_valid_addon_dir;
pub use manifest::load_manifest;

/* ========================================================================== */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
struct AddonReleaseAsset {
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
struct AddonRelease {
    pub id: u64,
    pub name: Version,
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
struct CommunityAddonData {
    pub id: String,
    pub name: String,
    pub short_description: String,
    pub description: String,
    pub version: Version,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage_url: Option<String>,
    pub repository_url: String,
    #[serde(rename = "requiresUniChat")]
    pub requires_unichat: Option<VersionRange>,
    pub stars: Option<u64>,
    pub updated_at: Option<String>,
    pub releases: Option<Vec<AddonRelease>>
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CommunityAddon {
    internal_id: String,
    id: String,
    name: String,
    short_description: String,
    description: String,
    version: Version,
    author: Option<String>,
    license: Option<String>,
    homepage_url: Option<String>,
    repository_url: String,
    #[serde(rename = "requiresUniChat")]
    requires_unichat: Option<VersionRange>,
    stars: Option<u64>,
    updated_at: Option<String>,
    releases: Option<Vec<AddonRelease>>,

    installed_version: Option<Version>,
    compatible: bool,
    has_update: bool
}

/* ========================================================================== */

fn is_compatible(requires_unichat: &Option<VersionRange>) -> bool {
    if let Some(range) = requires_unichat {
        return range.matches(&UNICHAT_VERSION);
    }

    return true;
}

fn has_update(installed_version: &Version, releases: &[AddonRelease]) -> bool {
    let installed_is_prerelease = installed_version.pre_release().is_some();

    for release in releases {
        if release.prerelease && !installed_is_prerelease {
            continue;
        }

        if release.name > *installed_version {
            return true;
        }
    }

    return false;
}

/* ========================================================================== */

fn community_addon_id(internal_id: &str, prefix: &str) -> String {
    let repository = internal_id.rsplit_once(':').map_or(internal_id, |(_, repository)| repository);

    return repository.strip_prefix(prefix).unwrap_or(repository).to_string();
}

fn find_installed_version(addons_path: &Path, id: &str) -> Option<Version> {
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

fn build_community_addon(data: CommunityAddonData, id: String, installed_version: Option<Version>) -> CommunityAddon {
    let compatible = is_compatible(&data.requires_unichat);

    let mut update_available = false;
    if let Some(installed_version) = &installed_version {
        let releases = data.releases.as_deref().unwrap_or_default();
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

fn find_release<'a>(data: &'a CommunityAddonData, release: &Version) -> Result<&'a AddonRelease, Error> {
    let releases = data.releases.as_deref().unwrap_or_default();
    let selected = releases.iter().find(|r| r.name == *release);

    return selected.ok_or_else(|| anyhow!("Release '{}' not found for '{}'", release, data.name));
}

fn check_compatibility(data: &CommunityAddonData, release: &AddonRelease) -> Result<(), Error> {
    if let Some(range) = &data.requires_unichat {
        if release.name == data.version && !range.matches(&UNICHAT_VERSION) {
            return Err(anyhow!("'{}' {} requires UniChat {}", data.name, release.name, range));
        }
    }

    return Ok(());
}

fn download_release_asset(asset: &AddonReleaseAsset) -> Result<Vec<u8>, Error> {
    log::info!("Downloading '{}' from '{}'", asset.name, asset.url);
    let mut response = ureq::get(&asset.url).call()?;
    let bytes = response.body_mut().read_to_vec()?;

    let expected = asset.digest.trim_start_matches("sha256:");
    let actual = format!("{:x}", Sha256::digest(&bytes));
    if actual != expected {
        return Err(anyhow!("Digest mismatch for asset '{}': expected '{}', got '{}'", asset.name, expected, actual));
    }

    return Ok(bytes);
}

fn download_release(id: &str, release: &AddonRelease) -> Result<(PathBuf, PathBuf), Error> {
    let asset_name = format!("{}-{}.zip", id, release.name);
    let asset = release.assets.iter().find(|a| a.name == asset_name);
    let asset = asset.ok_or_else(|| anyhow!("Release '{}' of '{}' has no asset '{}'", release.name, id, asset_name))?;
    let bytes = download_release_asset(asset)?;

    let extract_path = paths::get(AppPaths::AppCache).join(format!("install_{}", id));
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

fn replace_addon(src: &Path, dest: &Path, keep_list: &[PathBuf]) -> Result<(), Error> {
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

    fs::rename(src, dest).map_err(|e| anyhow!("Failed to move '{:?}' to '{:?}': {:#?}", src, dest, e))?;

    return Ok(());
}
