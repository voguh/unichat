/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::net::Ipv4Addr;

use if_addrs::IfAddr;
use if_addrs::get_if_addrs;
use serde_json::json;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::events;
use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::STATIC_APP_ICON;
use crate::THIRD_PARTY_LICENSES;
use crate::UNICHAT_AUTHORS;
use crate::UNICHAT_DESCRIPTION;
use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_HOMEPAGE;
use crate::UNICHAT_LICENSE_CODE;
use crate::UNICHAT_LICENSE_NAME;
use crate::UNICHAT_LICENSE_URL;
use crate::UNICHAT_NAME;
use crate::UNICHAT_VERSION;
use crate::utils;
use crate::utils::get_current_timestamp;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

pub mod gallery;
pub mod plugins;
pub mod store;
pub mod tour;
pub mod scrappers;
pub mod widgets;

#[tauri::command]
pub async fn get_app_info<R: Runtime>(_app: AppHandle<R>) -> Result<Value, String> {
    let metadata = json!({
        "displayName": UNICHAT_DISPLAY_NAME,
        "identifier": UNICHAT_NAME,
        "version": UNICHAT_VERSION,
        "description": UNICHAT_DESCRIPTION,
        "authors": UNICHAT_AUTHORS,
        "homepage": UNICHAT_HOMEPAGE,
        "icon": STATIC_APP_ICON,
        "licenseCode": UNICHAT_LICENSE_CODE,
        "licenseName": UNICHAT_LICENSE_NAME,
        "licenseUrl": UNICHAT_LICENSE_URL,

        "licenseFile": properties::get_app_path(AppPaths::UniChatLicense).to_string_lossy().to_string(),
        "widgetsDir": properties::get_app_path(AppPaths::UniChatUserWidgets).to_string_lossy().to_string(),
        "pluginsDir": properties::get_app_path(AppPaths::UniChatUserPlugins).to_string_lossy().to_string(),

        "thirdPartyLicenses": serde_json::from_str::<Value>(THIRD_PARTY_LICENSES).unwrap_or(Value::Array(vec![]))
    });

    return Ok(metadata);
}

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

#[tauri::command]
pub async fn is_dev<R: Runtime>(_app: AppHandle<R>) -> Result<bool, String> {
    return Ok(utils::is_dev())
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
