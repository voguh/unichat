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

pub type EmotesParserResult = Result<HashMap<String, UniChatEmote>, Error>;
pub static EMOTES_HASHSET: LazyLock<RwLock<HashMap<String, UniChatEmote>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn fetch_global_shared_emotes() -> Result<(), Error> {
    if let Ok(mut guard) = EMOTES_HASHSET.write() {
        if guard.is_empty() {
            log::info!("Fetching global shared emotes...");
            let bbtv_emotes = betterttv::fetch_global_emotes();
            let ffz_emotes = frankerfacez::fetch_global_emotes();
            let stv_emotes = seventv::fetch_global_emotes();

            guard.extend(bbtv_emotes);
            guard.extend(ffz_emotes);
            guard.extend(stv_emotes);
        }
    }

    return Ok(());
}

pub fn fetch_shared_emotes(platform: &str, channel_id: &str) -> Result<(), Error> {
    let platform = platform.to_string();
    let channel_id = channel_id.to_string();
    let _ = tauri::async_runtime::spawn_blocking(move || {
        if let Ok(mut guard) = EMOTES_HASHSET.write() {
            log::info!("Fetching channel shared emotes ({}:{})...", platform, channel_id);
            guard.extend(betterttv::fetch_channel_emotes(&platform, &channel_id));
            guard.extend(frankerfacez::fetch_channel_emotes(&platform, &channel_id));
            guard.extend(seventv::fetch_channel_emotes(&platform, &channel_id));
        }
    });

    return Ok(());
}
