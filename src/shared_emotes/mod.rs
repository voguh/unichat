/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
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
