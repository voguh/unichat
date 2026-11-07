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
pub struct FrankerFaceZEmote {
    pub id: u32,
    pub code: String
}

fn parse_emotes(emotes: Vec<FrankerFaceZEmote>) -> HashMap<String, UniChatEmote> {
    let mut parsed = HashMap::new();
    for emote in emotes.iter() {
        let unichat_emote = UniChatEmote {
            id: emote.id.to_string(),
            code: emote.code.clone(),
            // Image size `4` are used by default, so it's possible to use `1`, `2`, `4` images.
            url: format!("https://cdn.betterttv.net/frankerfacez_emote/{}/4", emote.id)
        };

        parsed.insert(emote.code.clone(), unichat_emote);
    }

    return parsed;
}

pub fn fetch_global_emotes() -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = "https://api.betterttv.net/3/cached/frankerfacez/emotes/global";
    let mut response = ureq::get(url).call()?;
    let emotes: Vec<FrankerFaceZEmote> = response.body_mut().read_json()?;

    return Ok(parse_emotes(emotes));
}

pub fn fetch_channel_emotes(platform: &str, channel_id: &str) -> Result<HashMap<String, UniChatEmote>, Error> {
    let url = format!("https://api.betterttv.net/3/cached/frankerfacez/users/{}/{}", platform, channel_id);
    let mut response = ureq::get(url).call()?;
    let emotes: Vec<FrankerFaceZEmote> = response.body_mut().read_json()?;

    return Ok(parse_emotes(emotes));
}
