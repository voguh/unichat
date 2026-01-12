/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::fs;
use std::path::Path;

use anyhow::anyhow;
use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::UNICHAT_AUTHORS;
use crate::UNICHAT_HOMEPAGE;
use crate::UNICHAT_LICENSE_CODE;
use crate::UNICHAT_VERSION;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

#[derive(Serialize, Deserialize, Hash, Clone, Debug)]
pub struct PluginManifestYAML {
    pub name: String,
    pub description: Option<String>,
    pub version: String,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: Vec<String>
}

pub fn load_manifest(plugin_path: &Path) -> Result<PluginManifestYAML, Error> {
    let manifest_path = plugin_path.join("manifest.yaml");
    let manifest_content = fs::read_to_string(&manifest_path)?;
    let mut manifest: PluginManifestYAML = serde_saphyr::from_str(&manifest_content)?;

    if plugin_path.starts_with(properties::get_app_path(AppPaths::UniChatSystemPlugins)) {
        if manifest.version == "${unichat_version}" {
            manifest.version = String::from(UNICHAT_VERSION);
        }

        if manifest.author.as_deref().is_some_and(|a| a == "${unichat_authors}") {
            manifest.author = Some(String::from(UNICHAT_AUTHORS));
        }

        if manifest.license.as_deref().is_some_and(|l| l == "${unichat_license}") {
            manifest.license = Some(String::from(UNICHAT_LICENSE_CODE));
        }

        if manifest.homepage.as_deref().is_some_and(|h| h == "${unichat_homepage}") {
            manifest.homepage = Some(String::from(UNICHAT_HOMEPAGE));
        }
    }

    if let Err(err) = semver::Version::parse(&manifest.version) {
        return Err(anyhow!("Invalid version '{}' for plugin '{}': {:?}", manifest.version, manifest.name, err));
    }

    return Ok(manifest);
}
