/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;
use std::path::Path;

use anyhow::Error;
use anyhow::anyhow;
use serde::Deserialize;
use serde::Serialize;
use serde::de::Error as DeError;

use crate::utils::semver::Version;
use crate::utils::semver::VersionRange;

/* ========================================================================== */

pub const MANIFEST_FILE: &str = "manifest.yaml";

/* ========================================================================== */

fn split_dependency(dep: &str) -> Result<(&str, &str), Error> {
    if let Some((name, range)) = dep.split_once('@') {
        return Ok((name.trim(), range.trim()));
    }

    return Err(anyhow!("Invalid dependency '{}'", dep));
}

fn deserialize_dependencies<'de, D: serde::Deserializer<'de>>(
    deserializer: D
) -> Result<HashMap<String, VersionRange>, D::Error> {
    let mut dependencies = HashMap::new();

    let raw_dependencies: Vec<String> = Vec::deserialize(deserializer)?;
    for dep in raw_dependencies {
        let (name, range) = split_dependency(&dep).map_err(D::Error::custom)?;

        if dependencies.contains_key(name) {
            let message = format!("Duplicate dependency '{}'", name);
            return Err(D::Error::custom(message));
        }

        let range = VersionRange::parse(range).map_err(D::Error::custom)?;

        dependencies.insert(name.to_string(), range);
    }

    return Ok(dependencies);
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UniChatAddonManifest {
    pub name: String,
    pub description: Option<String>,
    pub version: Version,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    #[serde(default, deserialize_with = "deserialize_dependencies")]
    pub dependencies: HashMap<String, VersionRange>
}

pub fn is_valid_addon_dir(id: &str, addon_path: &Path) -> bool {
    if id.starts_with(".") || !addon_path.is_dir() {
        return false;
    } else if id.chars().any(|c| !c.is_ascii_alphanumeric() && c != '_' && c != '-') {
        log::warn!("Skipping addon with invalid id '{}' from {:?}", id, addon_path);
        return false;
    }

    return true;
}

pub fn load_manifest(addon_path: &Path) -> Result<UniChatAddonManifest, Error> {
    let manifest_path = addon_path.join(MANIFEST_FILE);
    let manifest_content = fs::read_to_string(&manifest_path)?;
    return serde_saphyr::from_str(&manifest_content).map_err(|e| e.into());
}
