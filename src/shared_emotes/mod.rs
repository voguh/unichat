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

pub mod betterttv;
pub mod seventv;

pub static EMOTES_HASHSET: LazyLock<RwLock<HashMap<String, UniChatEmote>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn fetch_shared_emotes(channel_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut shared_emotes = HashMap::new();

    shared_emotes.extend(betterttv::fetch_emotes(channel_id));
    shared_emotes.extend(seventv::fetch_emotes(channel_id));

    let mut guard = EMOTES_HASHSET.write()?;

    for (key, value) in shared_emotes {
        guard.insert(key, value);
    }

    return Ok(());
}
