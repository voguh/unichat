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
pub struct SevenTVEmote {
    pub id: String,
    pub name: String,
    pub flags: u32
}

#[derive(Deserialize)]
pub struct SevenTVEmoteSet {
    pub emotes: Option<Vec<SevenTVEmote>>
}

#[derive(Deserialize)]
pub struct SevenTVUser {
    pub emote_set: Option<SevenTVEmoteSet>
}

fn parse_emotes(emotes: Vec<SevenTVEmote>) -> HashMap<String, UniChatEmote> {
    let mut parsed = HashMap::new();
    for emote in emotes.iter() {
        let unichat_emote = UniChatEmote {
            id: emote.id.clone(),
            code: emote.name.clone(),
            // Image size `4x` are used by default, so it's possible to use `1x`, `2x`, `3x`, `4x` images.
            // By default `webp` is used for better compatibility.
            url: format!("https://cdn.7tv.app/emote/{}/4x.webp", emote.id)
        };

        parsed.insert(emote.name.clone(), unichat_emote);
    }

    return parsed;
}

pub fn fetch_global_emotes() -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = "https://7tv.io/v3/emote-sets/global";
    let mut response = ureq::get(url).call()?;
    let emote_set: SevenTVEmoteSet = response.body_mut().read_json()?;

    return Ok(parse_emotes(emote_set.emotes.unwrap_or_default()));
}

pub fn fetch_channel_emotes(platform: &str, channel_id: &str) -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = format!("https://7tv.io/v3/users/{}/{}", platform, channel_id);
    let mut response = ureq::get(url).call()?;
    let user: SevenTVUser = response.body_mut().read_json()?;
    let emotes = user.emote_set.and_then(|emote_set| emote_set.emotes).unwrap_or_default();

    return Ok(parse_emotes(emotes));
}
