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
use std::sync::LazyLock;
use std::sync::RwLock;

use anyhow::Error;

use crate::events::unichat::UniChatEmote;

mod betterttv;
mod frankerfacez;
mod seventv;

pub static EMOTES_HASHSET: LazyLock<RwLock<HashMap<String, UniChatEmote>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn fetch_global_shared_emotes() -> Result<(), Error> {
    tauri::async_runtime::spawn(async move {
        let mut set = tokio::task::JoinSet::new();
        set.spawn(betterttv::fetch_global_emotes());
        set.spawn(frankerfacez::fetch_global_emotes());
        set.spawn(seventv::fetch_global_emotes());

        let mut emotes: HashMap<String, UniChatEmote> = HashMap::new();
        while let Some(result) = set.join_next().await {
            match result {
                Err(err) => log::error!("Failed to fetch global shared emotes: {:#?}", err),
                Ok(Err(err)) => log::error!("Failed to fetch global shared emotes: {:#?}", err),
                Ok(Ok(batch)) => {
                    emotes.extend(batch);
                }
            }
        }

        if let Ok(mut guard) = EMOTES_HASHSET.write() {
            guard.extend(emotes);
        }
    });

    return Ok(());
}

pub fn fetch_shared_emotes(platform: &str, channel_id: &str) -> Result<(), Error> {
    let platform = platform.to_string();
    let channel_id = channel_id.to_string();

    tauri::async_runtime::spawn(async move {
        log::info!("Fetching channel shared emotes ({}:{})...", platform, channel_id);

        let mut set = tokio::task::JoinSet::new();
        set.spawn(betterttv::fetch_channel_emotes(platform.clone(), channel_id.clone()));
        set.spawn(frankerfacez::fetch_channel_emotes(platform.clone(), channel_id.clone()));
        set.spawn(seventv::fetch_channel_emotes(platform.clone(), channel_id.clone()));

        let mut emotes: HashMap<String, UniChatEmote> = HashMap::new();
        while let Some(result) = set.join_next().await {
            match result {
                Err(err) => log::error!("Failed to fetch channel shared emotes ({}:{}): {:#?}", platform, channel_id, err),
                Ok(Err(err)) => log::error!("Failed to fetch channel shared emotes ({}:{}): {:#?}", platform, channel_id, err),
                Ok(Ok(batch)) => {
                    emotes.extend(batch);
                }
            }
        }

        if let Ok(mut guard) = EMOTES_HASHSET.write() {
            guard.extend(emotes);
        }
    });

    return Ok(());
}
