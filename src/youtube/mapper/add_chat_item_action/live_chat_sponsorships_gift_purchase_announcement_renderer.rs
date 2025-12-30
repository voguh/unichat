/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::anyhow;
use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatSponsorGiftEventPayload;
use crate::utils::get_current_timestamp;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;
use crate::youtube::mapper::structs::author::AuthorBadgeWrapper;
use crate::youtube::mapper::structs::author::AuthorNameWrapper;
use crate::youtube::mapper::structs::author::AuthorPhotoThumbnailsWrapper;
use crate::youtube::mapper::structs::author::parse_author_badges;
use crate::youtube::mapper::structs::author::parse_author_color;
use crate::youtube::mapper::structs::author::parse_author_name;
use crate::youtube::mapper::structs::author::parse_author_photo;
use crate::youtube::mapper::structs::author::parse_author_type;
use crate::youtube::mapper::structs::author::parse_author_username;
use crate::youtube::mapper::structs::message::MessageRun;
use crate::youtube::mapper::structs::message::MessageRunsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer {
    id: String,

    author_external_channel_id: String,

    header: Header,

    timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Header {
    live_chat_sponsorships_header_renderer: LiveChatSponsorshipsHeaderRenderer
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatSponsorshipsHeaderRenderer {
    author_name: AuthorNameWrapper,
    author_photo: AuthorPhotoThumbnailsWrapper,
    author_badges: Option<Vec<AuthorBadgeWrapper>>,

    primary_text: MessageRunsWrapper
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RunsWrapper {
    pub runs: Vec<Run>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Run {
    pub text: String
}

fn parse_count(render: &LiveChatSponsorshipsHeaderRenderer) -> Result<u16, Error> {
    let run = render.primary_text.runs.get(1).ok_or(anyhow!("No count run found"))?;
    let raw_count = match run {
        MessageRun::Text { text } => text,
        MessageRun::Emoji { .. } => return Err(anyhow!("Unexpected emoji in count run")),
    };

    let count: u16 = raw_count.parse()?;

    return Ok(count);
}

/* <============================================================================================> */

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed: LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer = serde_json::from_value(value)?;

    let channel_id = properties::get_item(PropertiesKey::YouTubeChannelId)?;
    let author_id = parsed.author_external_channel_id;
    let render = parsed.header.live_chat_sponsorships_header_renderer;
    let author_username = parse_author_username(&render.author_name)?;
    let author_name = parse_author_name(&render.author_name)?;
    let author_color = parse_author_color(&author_name)?;
    let author_badges = parse_author_badges(&render.author_badges, &None)?;
    let author_photo = parse_author_photo(&render.author_photo)?;
    let author_type = parse_author_type(&render.author_badges)?;
    let count = parse_count(&render)?;
    let timestamp_usec = get_current_timestamp()?;

    let event = UniChatEvent::SponsorGift(UniChatSponsorGiftEventPayload {
        channel_id: channel_id,
        channel_name: None,

        platform: UniChatPlatform::YouTube,
        flags: HashMap::new(),

        author_id: author_id,
        author_username: author_username,
        author_display_name: author_name,
        author_display_color: author_color,
        author_badges: author_badges,
        author_profile_picture_url: Some(author_photo),
        author_type: author_type,

        message_id: parsed.id,
        tier: None,
        count: count,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
