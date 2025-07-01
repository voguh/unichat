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

use serde::Deserialize;
use serde::Serialize;
use serde_json::Value;

use crate::events::unichat::UniChatEmote;
use crate::utils::parse_serde_error;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SevenTVEmote {
    pub id: String,
    pub name: String,
    pub flags: u32
}

fn log_err(err: Box<dyn std::error::Error>) -> Vec<SevenTVEmote>{
    log::warn!("Error on fetch emotes");
    log::debug!("{:?}", err);

    return Vec::new();
}

fn fetch_global_emotes(url: String) -> Result<Vec<SevenTVEmote>, Box<dyn std::error::Error>> {
    let mut response = ureq::get(&url).call()?;
    let data: Value = response.body_mut().read_json()?;
    let emotes: Vec<Value> = data.get("emotes").and_then(|v| v.as_array())
        .cloned().unwrap_or_else(|| Vec::new());

    return serde_json::from_value(Value::Array(emotes)).map_err(parse_serde_error);
}

fn fetch_channel_emotes(url: String) -> Result<Vec<SevenTVEmote>, Box<dyn std::error::Error>> {
    let mut response = ureq::get(&url).call()?;
    let data: Value = response.body_mut().read_json()?;
    let emote_set = data.get("emote_set").ok_or("Emote set not found")?;
    let emotes: Vec<Value> = emote_set.get("emotes").and_then(|v| v.as_array())
        .cloned().unwrap_or_else(|| Vec::new());

    return serde_json::from_value(Value::Array(emotes)).map_err(parse_serde_error);
}

pub fn fetch_emotes(channel_id: &str) -> HashMap<String, UniChatEmote> {
    let global_url = String::from("https://7tv.io/v3/emote-sets/global");
    let youtube_url = format!("https://7tv.io/v3/users/youtube/{}", channel_id);
    let twitch_url = format!("https://7tv.io/v3/users/twitch/{}", channel_id);

    let global_emotes = fetch_global_emotes(global_url).unwrap_or_else(log_err);
    let youtube_emotes = fetch_channel_emotes(youtube_url).unwrap_or_else(log_err);
    let twitch_emotes = fetch_channel_emotes(twitch_url).unwrap_or_else(log_err);

    let mut all_emotes = Vec::new();
    all_emotes.extend(global_emotes);
    all_emotes.extend(youtube_emotes);
    all_emotes.extend(twitch_emotes);

    let mut parsed = HashMap::new();
    for emote in all_emotes.iter() {
        parsed.insert(emote.name.clone(), UniChatEmote {
            id: emote.id.clone(),
            emote_type: emote.name.clone(),
            tooltip: emote.name.clone(),
            // Image size `4x` are used by default, so it's possible to use `1x`, `2x`, `3x`, `4x` images.
            // By default `webp` is used for better compatibility.
            url: format!("https://cdn.7tv.app/emote/{}/4x.webp", emote.id)
        });
    }

    return parsed;
}
