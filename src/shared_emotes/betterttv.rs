/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::Error;
use serde_json::Value;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEmote;

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

pub async fn fetch_global_emotes() -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = "https://api.betterttv.net/3/cached/emotes/global";
    let response = reqwest::get(url).await?;
    let response_body: Value = response.json().await?;
    let emotes: Vec<BetterTTVEmote> = serde_json::from_value(response_body)?;

    let mut parsed = HashMap::new();
    for emote in emotes.iter() {
        parsed.insert(emote.code.clone(), parse_emote(emote));
    }

    return Ok(parsed);
}

pub async fn fetch_channel_emotes(platform: String, channel_id: String) -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = format!("https://api.betterttv.net/3/cached/users/{}/{}", platform, channel_id);
    let response = reqwest::get(url).await?;
    let response_body: Value = response.json().await?;

    let mut emotes_list: Vec<Value> = Vec::new();
    if let Some(emotes) = response_body.get("channelEmotes") {
        let emotes = emotes.as_array().cloned().unwrap_or_default();
        emotes_list.extend(emotes);
    }

    if let Some(emotes) = response_body.get("sharedEmotes") {
        let emotes = emotes.as_array().cloned().unwrap_or_default();
        emotes_list.extend(emotes);
    }

    let emotes: Vec<BetterTTVEmote> = serde_json::from_value(Value::Array(emotes_list))?;

    let mut parsed = HashMap::new();
    for emote in emotes.iter() {
        parsed.insert(emote.code.clone(), parse_emote(emote));
    }

    return Ok(parsed);
}
