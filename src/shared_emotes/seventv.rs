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

use anyhow::anyhow;
use anyhow::Error;
use serde_json::Value;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEmote;

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

pub async fn fetch_global_emotes() -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = "https://7tv.io/v3/emote-sets/global";
    let response = reqwest::get(url).await?;
    let response_body: Value = response.json().await?;
    let emotes = response_body.get("emotes").and_then(|v| v.as_array()).cloned().unwrap_or_default();
    let emotes: Vec<SevenTVEmote> = serde_json::from_value(Value::Array(emotes))?;

    let mut parsed = HashMap::new();
    for emote in emotes.iter() {
        parsed.insert(emote.name.clone(), parse_emote(emote));
    }

    return Ok(parsed);
}

pub async fn fetch_channel_emotes(platform: String, channel_id: String) -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = format!("https://7tv.io/v3/users/{}/{}", platform, channel_id);
    let response = reqwest::get(url).await?;
    let response_body: Value = response.json().await?;
    let emote_set = response_body.get("emote_set").ok_or(anyhow!("Emote set not found"))?;
    let emotes = emote_set.get("emotes").and_then(|v| v.as_array()).cloned().unwrap_or_default();
    let emotes: Vec<SevenTVEmote> = serde_json::from_value(Value::Array(emotes))?;

    let mut parsed = HashMap::new();
    for emote in emotes.iter() {
        parsed.insert(emote.name.clone(), parse_emote(emote));
    }

    return Ok(parsed);
}
