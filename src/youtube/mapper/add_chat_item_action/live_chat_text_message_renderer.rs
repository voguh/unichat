/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatMessageEventPayload;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UNICHAT_EVENT_MESSAGE_TYPE;
use crate::utils::parse_serde_error;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;
use crate::youtube::mapper::structs::author::parse_author_badges;
use crate::youtube::mapper::structs::author::parse_author_color;
use crate::youtube::mapper::structs::author::parse_author_name;
use crate::youtube::mapper::structs::author::parse_author_username;
use crate::youtube::mapper::structs::author::parse_author_photo;
use crate::youtube::mapper::structs::author::parse_author_type;
use crate::youtube::mapper::structs::author::AuthorBadgeWrapper;
use crate::youtube::mapper::structs::author::AuthorNameWrapper;
use crate::youtube::mapper::structs::author::AuthorPhotoThumbnailsWrapper;
use crate::youtube::mapper::structs::message::parse_message_emojis;
use crate::youtube::mapper::structs::message::parse_message_string;
use crate::youtube::mapper::structs::message::MessageRunsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatTextMessageRenderer {
    id: String,

    author_external_channel_id: String,
    author_name: AuthorNameWrapper,
    author_photo: AuthorPhotoThumbnailsWrapper,
    author_badges: Option<Vec<AuthorBadgeWrapper>>,

    message: MessageRunsWrapper,

    timestamp_usec: String
}

/* <============================================================================================> */

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatTextMessageRenderer = serde_json::from_value(value).map_err(parse_serde_error)?;
    let author_username = parse_author_username(&parsed.author_name)?;
    let author_name = parse_author_name(&parsed.author_name)?;
    let author_color = parse_author_color(&author_name)?;
    let author_badges = parse_author_badges(&parsed.author_badges)?;
    let author_photo = parse_author_photo(&parsed.author_photo)?;
    let author_type = parse_author_type(&parsed.author_badges)?;
    let message = parse_message_string(&parsed.message)?;
    let emotes = parse_message_emojis(&parsed.message)?;
    let timestamp_usec = parsed.timestamp_usec.parse::<i64>()?;

    let event = UniChatEvent::Message {
        event_type: String::from(UNICHAT_EVENT_MESSAGE_TYPE),
        data: UniChatMessageEventPayload {
            channel_id: properties::get_item(PropertiesKey::YouTubeChannelId)?,
            channel_name: None,
            platform: UniChatPlatform::YouTube,

            author_id: parsed.author_external_channel_id,
            author_username: author_username,
            author_display_name: author_name,
            author_display_color: author_color,
            author_badges: author_badges,
            author_profile_picture_url: Some(author_photo),
            author_type: author_type,

            message_id: parsed.id,
            message_text: message,
            emotes: emotes,

            timestamp: timestamp_usec
        }
    };

    return Ok(Some(event));
}
