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
pub struct FrankerFaceZEmote {
    pub id: u32,
    pub code: String
}

fn log_err(err: Box<dyn std::error::Error>) -> Vec<FrankerFaceZEmote>{
    log::error!("Error fetching emotes: {}", err);

    return Vec::new();
}

fn fetch_global_emotes(url: String) -> Result<Vec<FrankerFaceZEmote>, Box<dyn std::error::Error>> {
    let mut response = ureq::get(&url).call()?;
    let data: Vec<Value> = response.body_mut().read_json()?;

    return serde_json::from_value(Value::Array(data)).map_err(parse_serde_error);
}

fn fetch_channel_emotes(url: String) -> Result<Vec<FrankerFaceZEmote>, Box<dyn std::error::Error>> {
    let mut response = ureq::get(&url).call()?;
    let data: Vec<Value> = response.body_mut().read_json()?;

    return serde_json::from_value(Value::Array(data)).map_err(parse_serde_error);
}

pub fn fetch_emotes(channel_id: &str) -> HashMap<String, UniChatEmote> {
    let global_url = String::from("https://api.betterttv.net/3/cached/frankerfacez/emotes/global");
    let youtube_url = format!("https://api.betterttv.net/3/cached/frankerfacez/users/youtube/{}", channel_id);
    let twitch_url = format!("https://api.betterttv.net/3/cached/frankerfacez/users/twitch/{}", channel_id);

    let global_emotes = fetch_global_emotes(global_url).unwrap_or_else(log_err);
    let youtube_emotes = fetch_channel_emotes(youtube_url).unwrap_or_else(log_err);
    let twitch_emotes = fetch_channel_emotes(twitch_url).unwrap_or_else(log_err);

    let mut all_emotes = Vec::new();
    all_emotes.extend(global_emotes);
    all_emotes.extend(youtube_emotes);
    all_emotes.extend(twitch_emotes);

    let mut parsed = HashMap::new();
    for emote in all_emotes.iter() {
        parsed.insert(emote.code.clone(), UniChatEmote {
            id: emote.id.to_string(),
            emote_type: emote.code.clone(),
            tooltip: emote.code.clone(),
            // Image size `4` are used by default, so it's possible to use `1`, `2`, `4` images.
            url: format!("https://cdn.betterttv.net/frankerfacez_emote/{}/4", emote.id)
        });
    }

    return parsed;
}
