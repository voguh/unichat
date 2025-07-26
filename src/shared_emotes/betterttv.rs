/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use serde::Deserialize;
use serde::Serialize;
use serde_json::Value;

use crate::events::unichat::UniChatEmote;
use crate::utils::is_valid_youtube_channel_id;
use crate::utils::parse_serde_error;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BetterTTVEmote {
    pub id: String,
    pub code: String,
    pub image_type: String
}

fn parse_emote(emote: &BetterTTVEmote) -> UniChatEmote {
    return UniChatEmote {
        id: emote.id.clone(),
        code: emote.code.clone(),
        // Image size `3x` are used by default, so it's possible to use `1x`, `2x`, `3x` images.
        // By default `webp` is used for better compatibility.
        url: format!("https://cdn.betterttv.net/emote/{}/3x.webp", emote.id)
    }
}

pub fn fetch_global_emotes() -> Result<HashMap<String, UniChatEmote>, Box<dyn std::error::Error>> {
    let url = "https://api.betterttv.net/3/cached/emotes/global";
    let mut response = ureq::get(url).call()?;
    let data: Vec<Value> = response.body_mut().read_json()?;
    let emotes: Vec<BetterTTVEmote> = serde_json::from_value(Value::Array(data)).map_err(parse_serde_error)?;

    let mut parsed = HashMap::new();
    for emote in emotes.iter() {
        parsed.insert(emote.code.clone(), parse_emote(emote));
    }

    return Ok(parsed);
}

pub fn fetch_channel_emotes(channel_id: &str) -> Result<HashMap<String, UniChatEmote>, Box<dyn std::error::Error>> {
    let url: String;
    if is_valid_youtube_channel_id(&channel_id) {
        url = format!("https://api.betterttv.net/3/cached/users/youtube/{}", channel_id);
    } else {
        url = format!("https://api.betterttv.net/3/cached/users/twitch/{}", channel_id);
    }

    let mut response = ureq::get(&url).call()?;
    let data: Value = response.body_mut().read_json()?;
    let mut emotes_list: Vec<Value> = Vec::new();

    if let Some(emotes) = data.get("channelEmotes") {
        let emotes = emotes.as_array().cloned().unwrap_or_default();
        emotes_list.extend(emotes);
    }

    if let Some(emotes) = data.get("sharedEmotes") {
        let emotes = emotes.as_array().cloned().unwrap_or_default();
        emotes_list.extend(emotes);
    }

    let emotes: Vec<BetterTTVEmote> = serde_json::from_value(Value::Array(emotes_list)).map_err(parse_serde_error)?;

    let mut parsed = HashMap::new();
    for emote in emotes.iter() {
        parsed.insert(emote.code.clone(), parse_emote(emote));
    }

    return Ok(parsed);
}
