/*!******************************************************************************
 * UniChat
 * Copyright (c) 2024-2026 Voguh
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

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatMessageEventPayload;
use crate::events::unichat::UniChatPlatform;
use crate::utils::get_current_timestamp;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;
use crate::youtube::mapper::structs::author::AuthorBadgeWrapper;
use crate::youtube::mapper::structs::author::AuthorNameWrapper;
use crate::youtube::mapper::structs::author::AuthorPhotoThumbnailsWrapper;
use crate::youtube::mapper::structs::author::BeforeContentButton;
use crate::youtube::mapper::structs::author::parse_author_badges;
use crate::youtube::mapper::structs::author::parse_author_color;
use crate::youtube::mapper::structs::author::parse_author_name;
use crate::youtube::mapper::structs::author::parse_author_photo;
use crate::youtube::mapper::structs::author::parse_author_type;
use crate::youtube::mapper::structs::author::parse_author_username;
use crate::youtube::mapper::structs::message::MessageRunsWrapper;
use crate::youtube::mapper::structs::message::parse_message_emojis;
use crate::youtube::mapper::structs::message::parse_message_string;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatTextMessageRenderer {
    id: String,

    author_external_channel_id: String,
    author_name: AuthorNameWrapper,
    author_photo: AuthorPhotoThumbnailsWrapper,
    author_badges: Option<Vec<AuthorBadgeWrapper>>,

    message: MessageRunsWrapper,

    before_content_buttons: Option<Vec<BeforeContentButton>>,

    timestamp_usec: String
}

/* <============================================================================================> */

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed: LiveChatTextMessageRenderer = serde_json::from_value(value)?;

    let channel_id = properties::get_item(PropertiesKey::YouTubeChannelId)?;
    let author_id = parsed.author_external_channel_id;
    let author_username = parse_author_username(&parsed.author_name)?;
    let author_name = parse_author_name(&parsed.author_name)?;
    let author_color = parse_author_color(&author_name)?;
    let author_badges = parse_author_badges(&parsed.author_badges, &parsed.before_content_buttons)?;
    let author_photo = parse_author_photo(&parsed.author_photo)?;
    let author_type = parse_author_type(&parsed.author_badges)?;
    let message = parse_message_string(&parsed.message)?;
    let emotes = parse_message_emojis(&parsed.message)?;
    let timestamp_usec = get_current_timestamp()?;

    let event = UniChatEvent::Message(UniChatMessageEventPayload {
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
        message_text: message,
        emotes: emotes,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
