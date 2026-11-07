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
use serde::Deserialize;
use serde::Serialize;

use crate::events::UniChatEmote;
use crate::utils::ureq;

/* ========================================================================== */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BetterTTVEmote {
    pub id: String,
    pub code: String,
    pub image_type: String
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BetterTTVChannel {
    pub channel_emotes: Option<Vec<BetterTTVEmote>>,
    pub shared_emotes: Option<Vec<BetterTTVEmote>>
}

fn parse_emotes(emotes: Vec<BetterTTVEmote>) -> HashMap<String, UniChatEmote> {
    let mut parsed = HashMap::new();
    for emote in emotes.iter() {
        let unichat_emote = UniChatEmote {
            id: emote.id.clone(),
            code: emote.code.clone(),
            // Image size `3x` are used by default, so it's possible to use `1x`, `2x`, `3x` images.
            // By default `webp` is used for better compatibility.
            url: format!("https://cdn.betterttv.net/emote/{}/3x.webp", emote.id)
        };

        parsed.insert(emote.code.clone(), unichat_emote);
    }

    return parsed;
}

pub fn fetch_global_emotes() -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = "https://api.betterttv.net/3/cached/emotes/global";
    let mut response = ureq::get(url).call()?;
    let emotes: Vec<BetterTTVEmote> = response.body_mut().read_json()?;

    return Ok(parse_emotes(emotes));
}

pub fn fetch_channel_emotes(platform: &str, channel_id: &str) -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = format!("https://api.betterttv.net/3/cached/users/{}/{}", platform, channel_id);
    let mut response = ureq::get(url).call()?;
    let channel: BetterTTVChannel = response.body_mut().read_json()?;

    let mut emotes = channel.channel_emotes.unwrap_or_default();
    emotes.extend(channel.shared_emotes.unwrap_or_default());

    return Ok(parse_emotes(emotes));
}
