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

use serde::Deserialize;
use serde::Serialize;
use serde_json::Value;

use crate::events::unichat::UniChatEmote;
use crate::utils::parse_serde_error;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BTTVEmote {
    pub id: String,
    pub code: String,
    pub image_type: String
}

fn log_err(err: Box<dyn std::error::Error>) -> Vec<BTTVEmote>{
    log::error!("Error fetching emotes: {}", err);

    return Vec::new();
}

fn fetch_global_emotes(url: String) -> Result<Vec<BTTVEmote>, Box<dyn std::error::Error>> {
    let mut response = ureq::get(&url).call()?;
    let data: Vec<Value> = response.body_mut().read_json()?;

    return serde_json::from_value(Value::Array(data)).map_err(parse_serde_error);
}

fn fetch_channel_emotes(url: String) -> Result<Vec<BTTVEmote>, Box<dyn std::error::Error>> {
    let mut response = ureq::get(&url).call()?;
    let data: Value = response.body_mut().read_json()?;
    let mut emotes_list: Vec<Value> = Vec::new();

    if let Some(emotes) = data.get("channelEmotes") {
        let emotes = emotes.as_array().map(|a| a.clone()).unwrap_or_else(|| Vec::new());
        emotes_list.extend(emotes);
    }

    if let Some(emotes) = data.get("sharedEmotes") {
        let emotes = emotes.as_array().map(|a| a.clone()).unwrap_or_else(|| Vec::new());
        emotes_list.extend(emotes);
    }

    return serde_json::from_value(serde_json::Value::Array(emotes_list)).map_err(parse_serde_error);
}

pub fn fetch_emotes(channel_id: &str) -> Result<Vec<UniChatEmote>, Box<dyn std::error::Error>> {
    let global_url = String::from("https://api.betterttv.net/3/cached/emotes/global");
    let youtube_url = format!("https://api.betterttv.net/3/cached/users/youtube/{}", channel_id);
    let twitch_url = format!("https://api.betterttv.net/3/cached/users/twitch/{}", channel_id);

    let global_emotes = fetch_global_emotes(global_url).unwrap_or_else(log_err);
    let youtube_emotes = fetch_channel_emotes(youtube_url).unwrap_or_else(log_err);
    let twitch_emotes = fetch_channel_emotes(twitch_url).unwrap_or_else(log_err);

    let mut all_emotes = Vec::new();
    all_emotes.extend(global_emotes);
    all_emotes.extend(youtube_emotes);
    all_emotes.extend(twitch_emotes);

    let mut parsed = Vec::new();
    for emote in all_emotes.iter() {
        parsed.push(UniChatEmote {
            id: emote.id.clone(),
            emote_type: emote.code.clone(),
            tooltip: emote.code.clone(),
            url: format!("https://cdn.betterttv.net/emote/{}/3x.{}", emote.id, emote.image_type)
        });
    }

    return Ok(parsed);
}
