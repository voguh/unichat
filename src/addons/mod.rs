/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;
use anyhow::anyhow;
use serde::Deserialize;
use serde::Serialize;
use sha2::Digest;
use sha2::Sha256;

use crate::UNICHAT_VERSION;
use crate::utils::semver;
use crate::utils::semver::version::Version;
use crate::utils::semver::version_range::VersionRange;
use crate::utils::ureq;

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

pub fn download_release_asset(asset: &AddonReleaseAsset) -> Result<Vec<u8>, Error> {
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
