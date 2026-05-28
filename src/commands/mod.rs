/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::net::Ipv4Addr;
use std::time::Duration;
use std::time::SystemTime;

use if_addrs::get_if_addrs;
use if_addrs::IfAddr;
use tauri::AppHandle;
use tauri::Runtime;

use crate::THIRD_PARTY_LICENSES;
use crate::UNICHAT_VERSION;
use crate::events;
use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::utils::get_current_timestamp;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::semver;

pub mod emulator;
pub mod gallery;
pub mod plugins;
pub mod store;
pub mod tour;
pub mod scrapers;
pub mod userstore;
pub mod widgets;

/* ================================================================================================================== */

fn is_virtual_interface(name: &str) -> bool {
    let name = name.to_lowercase();

    let blocked = [
        "docker",
        "br-",
        "veth",
        "virbr",
        "tun",
        "tap",
        "wg",
        "lxc",
        "vethernet",
        "hyper-v",
        "wsl",
        "dockernat",
        "virtualbox",
        "vmware"
    ];

    blocked.iter().any(|b| name.contains(b))
}

#[tauri::command]
pub async fn get_system_hosts<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<String>, String> {
    let ifaces = get_if_addrs().map_err(|e| format!("An error occurred on get network interfaces: {:#?}", e))?;

    let mut lan_ips: Vec<String> = Vec::new();
    for iface in ifaces {
        if iface.is_loopback() || is_virtual_interface(&iface.name) {
            continue;
        }

        if let IfAddr::V4(v4) = iface.addr {
            let ip: Ipv4Addr = v4.ip;
            if ip.is_private() && !ip.is_loopback() && !ip.is_link_local() {
                lan_ips.push(ip.to_string());
            }
        } else if let IfAddr::V6(v6) = iface.addr {
            let ip = v6.ip;
            if ip.is_unique_local() {
                lan_ips.push(ip.to_string());
            }
        }
    }

    return Ok(lan_ips);
}

/* ================================================================================================================== */

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
    updated_at: String,
    published_at: Option<String>
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UniChatReleaseInfo {
    has_update: bool,
    latest_stable: Option<UniChatRelease>,
    latest_unstable: Option<UniChatRelease>
}

#[tauri::command]
pub async fn get_releases<R: Runtime>(_app: AppHandle<R>) -> Result<UniChatReleaseInfo, String> {
    let mut releases: Vec<UniChatRelease> = Vec::new();
    let app_cache_dir = properties::get_app_path(AppPaths::AppCache);
    if !app_cache_dir.exists() {
        fs::create_dir_all(&app_cache_dir).map_err(|e| format!("{:#?}", e))?;
    }

    /* ====================================================================== */

    let cached_releases_path = app_cache_dir.join("cached_releases.json");
    if let Ok(metadata) = fs::metadata(&cached_releases_path) {
        let modified_at = metadata.modified().map_err(|e| format!("{:#?}", e))?;
        let now = SystemTime::now();
        let duration = now.duration_since(modified_at).map_err(|e| format!("{:#?}", e))?;

        if duration < Duration::from_secs(3600) {
            log::info!("Using cached releases file (age: {} seconds)", duration.as_secs());
            let data = fs::read_to_string(&cached_releases_path).map_err(|e| format!("{:#?}", e))?;
            let json_data: Vec<UniChatRelease> = serde_json::from_str(&data).map_err(|e| format!("{:#?}", e))?;
            releases = json_data;
        }
    }

    /* ====================================================================== */

    if releases.is_empty() {
        log::info!("Fetching releases from UniChat API...");
        let url = "https://unichat.voguh.me/api/v1/unichat-releases";
        let response = reqwest::get(url).await.map_err(|e| format!("{:#?}", e))?;
        let response_body = response.text().await.map_err(|e| format!("{:#?}", e))?;

        fs::write(&cached_releases_path, &response_body).map_err(|e| format!("{:#?}", e))?;
        releases = serde_json::from_str(&response_body).map_err(|e| format!("{:#?}", e))?;
    }

    /* ====================================================================== */

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

/* ================================================================================================================== */

#[tauri::command]
pub async fn dispatch_clear_chat<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    let timestamp_usec = get_current_timestamp().map_err(|e| format!("An error occurred on get current timestamp: {:#?}", e))?;

    let event = UniChatEvent::Clear(UniChatClearEventPayload {
        platform: None,

        timestamp: timestamp_usec
    });

    events::emit(event).map_err(|e| format!("An error occurred on emit ClearChat event: {:#?}", e))?;

    return Ok(());
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn get_third_party_licenses<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<serde_json::Value>, String> {
    let third_party_licenses = serde_json::from_str(THIRD_PARTY_LICENSES).map_err(|e| format!("Failed to parse third party licenses: {:#?}", e))?;
    return Ok(third_party_licenses);
}
