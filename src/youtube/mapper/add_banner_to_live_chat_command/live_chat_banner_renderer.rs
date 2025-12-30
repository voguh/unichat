/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use serde::Deserialize;
use serde::Serialize;

use crate::error::Error;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRaidEventPayload;
use crate::utils::get_current_timestamp;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;
use crate::youtube::mapper::structs::author::parse_author_color;
use crate::youtube::mapper::structs::author::parse_author_name_str;
use crate::youtube::mapper::structs::author::parse_author_username_str;
use crate::youtube::mapper::structs::author::AuthorPhotoThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatBannerRenderer {
    action_id: String,
    banner_type: String,
    target_id: String,
    is_stackable: bool,
    contents: LiveChatBannerRedirectRendererWrapper
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatBannerRedirectRendererWrapper {
    live_chat_banner_redirect_renderer: Option<LiveChatBannerRedirectRenderer>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatBannerRedirectRenderer {
    author_photo: AuthorPhotoThumbnailsWrapper,
    banner_message: BannerMessage
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct BannerMessage {
    runs: Vec<BannerMessageRuns>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct BannerMessageRuns {
    text: String,
    bold: Option<bool>,
    font_face: Option<String>,
    text_color: Option<u32>
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed: LiveChatBannerRenderer = serde_json::from_value(value)?;
    let mut event: Option<UniChatEvent> = None;

    if parsed.banner_type == "LIVE_CHAT_BANNER_TYPE_CROSS_CHANNEL_REDIRECT" {
        if let Some(renderer) = parsed.contents.live_chat_banner_redirect_renderer {
            let first_run = renderer.banner_message.runs.first().ok_or("No runs found in banner message")?;

            let channel_id = properties::get_item(PropertiesKey::YouTubeChannelId)?;
            let author_username = parse_author_username_str(first_run.text.clone())?;
            let author_name = parse_author_name_str(first_run.text.clone())?;
            let author_color = parse_author_color(&author_name)?;
            let author_photo = renderer.author_photo.thumbnails.last().ok_or("No thumbnails found in author photo")?;
            let timestamp_usec = get_current_timestamp()?;

            if first_run.bold.is_some() {
                event = Some(UniChatEvent::Raid(UniChatRaidEventPayload {
                    channel_id: channel_id,
                    channel_name: None,

                    platform: UniChatPlatform::YouTube,
                    flags: HashMap::new(),

                    author_id: None,
                    author_username: author_username,
                    author_display_name: author_name,
                    author_display_color: author_color,
                    author_profile_picture_url: Some(author_photo.url.clone()),
                    author_badges: Vec::new(),
                    author_type: None,

                    message_id: parsed.action_id,
                    viewer_count: None,

                    timestamp: timestamp_usec
                }));
            }
        }
    }

    return Ok(event);
}
