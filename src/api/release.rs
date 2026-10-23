/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::time::Duration;

use anyhow::Error;

use crate::UNICHAT_VERSION;
use crate::api;
use crate::cache;
use crate::utils::semver;

/* ========================================================================== */

const RELEASES_FILE_TTL: Duration = Duration::from_secs(60 * 60);

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct UniChatRelease {
    id: u64,
    name: String,
    description: String,

    url: String,
    source_url: String,
    prerelease: bool,

    created_at: String,
    published_at: Option<String>
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UniChatReleaseInfo {
    has_update: bool,
    latest_stable: Option<UniChatRelease>,
    latest_unstable: Option<UniChatRelease>
}

pub fn get_info() -> Result<UniChatReleaseInfo, Error> {
    let mut releases: Vec<UniChatRelease> = cache::get_or_fetch("releases", RELEASES_FILE_TTL, || api::get("/v1/unichat-releases"))?;

    releases.sort_by(|a, b| semver::rcompare(&a.name, &b.name));
    let latest_stable = releases.iter().find(|r| !r.prerelease);
    let latest_unstable = releases.iter().find(|r| r.prerelease);

    let mut has_update = false;
    if let Some(latest_stable) = latest_stable {
        if semver::gt(&latest_stable.name, UNICHAT_VERSION) {
            has_update = true;
        }
    }

    return Ok(UniChatReleaseInfo {
        has_update: has_update,
        latest_stable: latest_stable.cloned(),
        latest_unstable: latest_unstable.cloned()
    });
}
