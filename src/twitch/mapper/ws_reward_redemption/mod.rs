/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use actix_web::cookie::time;
use serde::Deserialize;
use serde::Serialize;

use crate::error::Error;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRedemptionEventPayload;
use crate::twitch::mapper::handle_redemption_event;
use crate::twitch::mapper::structs::author::parse_author_color;

#[derive(Serialize, Deserialize, Debug)]
struct WsRewardRedemption {
    id: String,
    user: WsRewardRedemptionUser,

    channel_id: String,
    reward: WsRewardRedemptionReward,
    user_input: Option<String>,
    redeemed_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct WsRewardRedemptionUser {
    id: String,
    login: String,
    display_name: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct WsRewardRedemptionReward {
    id: String,
    title: String,
    prompt: Option<String>,
    cost: u32,
    image: Option<HashMap<String, String>>,
    default_image: HashMap<String, String>,
}

fn parse_reward_icon_url(reward: &WsRewardRedemptionReward) -> Result<String, Error> {
    if let Some(images) = &reward.image {
        if let Some(url) = images.get("url_1x") {
            return Ok(url.to_owned());
        }
    } else {
        if let Some(url) = reward.default_image.get("url_1x") {
            return Ok(url.to_owned());
        }
    }

    return Ok(String::new());
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed: WsRewardRedemption = serde_json::from_value(value)?;

    let display_color = parse_author_color(None, &Some(parsed.user.login.clone()))?;
    let offset_date_time = time::OffsetDateTime::parse(&parsed.redeemed_at, &time::format_description::well_known::Rfc3339)?;
    let icon_url = parse_reward_icon_url(&parsed.reward)?;
    let timestamp_usec = offset_date_time.unix_timestamp();

    let event_payload = UniChatRedemptionEventPayload {
        channel_id: parsed.channel_id,
        channel_name: None,

        platform: UniChatPlatform::Twitch,
        flags: HashMap::new(),

        author_id: parsed.user.id,
        author_username: Some(parsed.user.login),
        author_display_name: parsed.user.display_name,
        author_display_color: display_color,
        author_profile_picture_url: None,
        author_badges: Vec::new(),
        author_type: None,

        reward_id: parsed.reward.id,
        reward_title: parsed.reward.title,
        reward_description: parsed.reward.prompt,
        reward_cost: parsed.reward.cost,
        reward_icon_url: icon_url,

        message_id: parsed.id,
        message_text: parsed.user_input.clone(),
        emotes: Vec::new(),

        timestamp: timestamp_usec
    };

    if parsed.user_input.is_some_and(|ui| !ui.is_empty()) {
        if let Some(redemption_event) = handle_redemption_event(event_payload) {
            let event = UniChatEvent::Redemption(redemption_event);

            return Ok(Some(event));
        }
    } else {
        let event = UniChatEvent::Redemption(event_payload);

        return Ok(Some(event));
    }



    return Ok(None);
}
