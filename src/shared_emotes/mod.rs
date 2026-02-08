/*!******************************************************************************
 * UniChat
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

pub type EmotesParserResult = Result<HashMap<String, UniChatEmote>, Error>;
pub static EMOTES_HASHSET: LazyLock<RwLock<HashMap<String, UniChatEmote>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn fetch_shared_emotes(platform: &str, channel_id: &str) -> Result<(), Error> {
    let platform = platform.to_string();
    let channel_id = channel_id.to_string();
    let _ = tauri::async_runtime::spawn_blocking(move || {
        let mut shared_emotes = HashMap::new();

        {
            if let Ok(guard) = EMOTES_HASHSET.read() {
                if guard.is_empty() {
                    log::info!("Fetching global shared emotes...");
                    log::info!("Fetching global BetterTTV emotes...");
                    shared_emotes.extend(betterttv::fetch_global_emotes());
                    log::info!("Fetching global FrankerFaceZ emotes...");
                    shared_emotes.extend(frankerfacez::fetch_global_emotes());
                    log::info!("Fetching global 7TV emotes...");
                    shared_emotes.extend(seventv::fetch_global_emotes());
                }
            }
        }

        log::info!("Fetching channel shared emotes ({}:{})...", platform, channel_id);
        log::info!("Fetching channel BetterTTV emotes ({}:{})...", platform, channel_id);
        shared_emotes.extend(betterttv::fetch_channel_emotes(&platform, &channel_id));
        log::info!("Fetching channel FrankerFaceZ emotes ({}:{})...", platform, channel_id);
        shared_emotes.extend(frankerfacez::fetch_channel_emotes(&platform, &channel_id));
        log::info!("Fetching channel 7TV emotes ({}:{})...", platform, channel_id);
        shared_emotes.extend(seventv::fetch_channel_emotes(&platform, &channel_id));

        log::info!("Fetched {} shared emotes ({}:{})", shared_emotes.len(), platform, channel_id);

        if let Ok(mut guard) = EMOTES_HASHSET.write() {
            for (key, value) in shared_emotes {
                guard.insert(key, value);
            }
        }
    });

    return Ok(());
}
