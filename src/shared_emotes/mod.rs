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

pub static EMOTES_HASHSET: LazyLock<RwLock<HashMap<String, UniChatEmote>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn fetch_shared_emotes(channel_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut shared_emotes = HashMap::new();

    if let Ok(guard) = EMOTES_HASHSET.read() {
        if guard.is_empty() {
            shared_emotes.extend(betterttv::fetch_global_emotes().unwrap_or_default());
            shared_emotes.extend(frankerfacez::fetch_global_emotes().unwrap_or_default());
            shared_emotes.extend(seventv::fetch_global_emotes().unwrap_or_default());
        }
    }

    shared_emotes.extend(betterttv::fetch_channel_emotes(channel_id).unwrap_or_default());
    shared_emotes.extend(frankerfacez::fetch_channel_emotes(channel_id).unwrap_or_default());
    shared_emotes.extend(seventv::fetch_channel_emotes(channel_id).unwrap_or_default());

    let mut guard = EMOTES_HASHSET.write()?;

    for (key, value) in shared_emotes {
        guard.insert(key, value);
    }

    return Ok(());
}
