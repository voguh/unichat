/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::path::Path;

use anyhow::Error;
use anyhow::anyhow;
use serde::Deserialize;
use serde::Serialize;

use crate::utils::semver::version::Version;

/* ========================================================================== */

#[derive(Serialize, Deserialize, Hash, Clone, Debug)]
pub struct UniChatAddonManifest {
    pub name: String,
    pub description: Option<String>,
    pub version: String,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: Vec<String>
}

pub fn load_manifest(addon_path: &Path) -> Result<UniChatAddonManifest, Error> {
    let manifest_path = addon_path.join("manifest.yaml");
    let manifest_content = fs::read_to_string(&manifest_path)?;
    let manifest: UniChatAddonManifest = serde_saphyr::from_str(&manifest_content)?;

    if let Err(err) = Version::parse(&manifest.version) {
        return Err(anyhow!("Invalid version '{}' for addon '{}': {:#?}", manifest.version, manifest.name, err));
    }

    return Ok(manifest);
}
