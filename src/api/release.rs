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
use crate::utils::semver::Version;

/* ========================================================================== */

const TTL: Duration = Duration::from_secs(60 * 60);

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct UniChatRelease {
    id: u64,
    name: Version,
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

pub fn get_release_info() -> Result<UniChatReleaseInfo, Error> {
    let mut releases: Vec<UniChatRelease> = cache::get_or_fetch("releases", TTL, || api::get("/unichat-releases"))?;

    releases.sort_by(|a, b| b.name.cmp(&a.name));
    let latest_stable = releases.iter().find(|r| !r.prerelease);
    let latest_unstable = releases.iter().find(|r| r.prerelease);
    let has_update = latest_stable.is_some_and(|r| r.name > *UNICHAT_VERSION);

    return Ok(UniChatReleaseInfo {
        has_update: has_update,
        latest_stable: latest_stable.cloned(),
        latest_unstable: latest_unstable.cloned()
    });
}
