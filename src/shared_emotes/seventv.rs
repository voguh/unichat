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
use crate::shared_emotes::EmotesParserResult;
use crate::utils::is_valid_youtube_channel_id;
use crate::utils::parse_serde_error;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SevenTVEmote {
    pub id: String,
    pub name: String,
    pub flags: u32
}

fn parse_emote(emote: &SevenTVEmote) -> UniChatEmote {
    return UniChatEmote {
        id: emote.id.clone(),
        code: emote.name.clone(),
        // Image size `4x` are used by default, so it's possible to use `1x`, `2x`, `3x`, `4x` images.
        // By default `webp` is used for better compatibility.
        url: format!("https://cdn.7tv.app/emote/{}/4x.webp", emote.id)
    };
}

fn handle_request(url: &str, parser: fn(Value) -> EmotesParserResult) -> EmotesParserResult {
    let mut response = ureq::get(url).call()?;
    let data: Value = response.body_mut().read_json()?;

    return parser(data);
}

pub fn fetch_global_emotes() -> HashMap<String, UniChatEmote> {
    let url = "https://7tv.io/v3/emote-sets/global";
    let parser = |data: Value| -> EmotesParserResult {
        let emotes = data.get("emotes").and_then(|v| v.as_array()).cloned().unwrap_or_default();
        let emotes: Vec<SevenTVEmote> = serde_json::from_value(Value::Array(emotes)).map_err(parse_serde_error)?;

        let mut parsed = HashMap::new();
        for emote in emotes.iter() {
            parsed.insert(emote.name.clone(), parse_emote(emote));
        }

        return Ok(parsed);
    };

    return handle_request(url, parser).unwrap_or_else(|err| {
        log::error!("Failed to fetch global 7TV emotes: {:?}", err);
        return HashMap::new();
    });
}

pub fn fetch_channel_emotes(channel_id: &str) -> HashMap<String, UniChatEmote> {
    let url: String;
    if is_valid_youtube_channel_id(&channel_id) {
        url = format!("https://7tv.io/v3/users/youtube/{}", channel_id);
    } else {
        url = format!("https://7tv.io/v3/users/twitch/{}", channel_id);
    }

    let parser = |data: Value| -> EmotesParserResult {
        let emote_set = data.get("emote_set").ok_or("Emote set not found")?;
        let emotes = emote_set.get("emotes").and_then(|v| v.as_array()).cloned().unwrap_or_default();
        let emotes: Vec<SevenTVEmote> = serde_json::from_value(Value::Array(emotes)).map_err(parse_serde_error)?;

        let mut parsed = HashMap::new();
        for emote in emotes.iter() {
            parsed.insert(emote.name.clone(), parse_emote(emote));
        }

        return Ok(parsed);
    };

    return handle_request(&url, parser).unwrap_or_else(|err| {
        log::error!("Failed to fetch global 7TV emotes: {:?}", err);
        return HashMap::new();
    });
}
