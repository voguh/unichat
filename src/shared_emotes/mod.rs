/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::sync::LazyLock;
use std::sync::RwLock;

use crate::events::unichat::UniChatEmote;

mod betterttv;
mod frankerfacez;
mod seventv;

pub type EmotesParserResult = Result<HashMap<String, UniChatEmote>, Box<dyn std::error::Error>>;
pub static EMOTES_HASHSET: LazyLock<RwLock<HashMap<String, UniChatEmote>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn fetch_shared_emotes(channel_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let channel_id = channel_id.to_string();

    let _ = tauri::async_runtime::spawn_blocking(move || {
        let mut shared_emotes = HashMap::new();

        if let Ok(guard) = EMOTES_HASHSET.read() {
            if guard.is_empty() {
                shared_emotes.extend(betterttv::fetch_global_emotes());
                shared_emotes.extend(frankerfacez::fetch_global_emotes());
                shared_emotes.extend(seventv::fetch_global_emotes());
            }
        }

        shared_emotes.extend(betterttv::fetch_channel_emotes(&channel_id));
        shared_emotes.extend(frankerfacez::fetch_channel_emotes(&channel_id));
        shared_emotes.extend(seventv::fetch_channel_emotes(&channel_id));

        if let Ok(mut guard) = EMOTES_HASHSET.write() {
            for (key, value) in shared_emotes {
                guard.insert(key, value);
            }
        }
    });

    return Ok(());
}
