/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;

use serde_json::Value;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEmote;
use crate::shared_emotes::EmotesParserResult;
use crate::utils::ureq;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FrankerFaceZEmote {
    pub id: u32,
    pub code: String
}

fn parse_emote(emote: &FrankerFaceZEmote) -> UniChatEmote {
    return UniChatEmote {
        id: emote.id.to_string(),
        code: emote.code.clone(),
        // Image size `4` are used by default, so it's possible to use `1`, `2`, `4` images.
        url: format!("https://cdn.betterttv.net/frankerfacez_emote/{}/4", emote.id)
    };
}

fn handle_request(url: &str, parser: fn(Value) -> EmotesParserResult) -> EmotesParserResult {
    let mut response = ureq::get(url).call()?;
    let data: Value = response.body_mut().read_json()?;

    return parser(data);
}

pub fn fetch_global_emotes() -> HashMap<String, UniChatEmote> {
    let url = "https://api.betterttv.net/3/cached/frankerfacez/emotes/global";
    let parser = |data: Value| -> EmotesParserResult {
        let emotes: Vec<FrankerFaceZEmote> = serde_json::from_value(data)?;

        let mut parsed = HashMap::new();
        for emote in emotes.iter() {
            parsed.insert(emote.code.clone(), parse_emote(emote));
        }

        return Ok(parsed);
    };

    return handle_request(url, parser).unwrap_or_else(|err| {
        log::error!("Failed to fetch global FrankerFaceZ emotes: {:?}", err);
        return HashMap::new();
    });
}

pub fn fetch_channel_emotes(platform: &str, channel_id: &str) -> HashMap<String, UniChatEmote> {
    let url = format!("https://api.betterttv.net/3/cached/frankerfacez/users/{}/{}", platform, channel_id);
    let parser = |data: Value| -> EmotesParserResult {
        let emotes: Vec<FrankerFaceZEmote> = serde_json::from_value(data)?;

        let mut parsed = HashMap::new();
        for emote in emotes.iter() {
            parsed.insert(emote.code.clone(), parse_emote(emote));
        }

        return Ok(parsed);
    };

    return handle_request(&url, parser).unwrap_or_else(|err| {
        log::error!("Failed to fetch global FrankerFaceZ emotes ({}:{}): {:?}", platform, channel_id, err);
        return HashMap::new();
    });
}
