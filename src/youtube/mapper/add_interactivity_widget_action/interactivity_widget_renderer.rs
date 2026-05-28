/*!******************************************************************************
 * Copyright (c) 2026 Voguh
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
use crate::events::unichat::UniChatGiftEventPayload;
use crate::events::unichat::UniChatPlatform;
use crate::utils::get_current_timestamp;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;
use crate::youtube::mapper::structs::Thumbnail;
use crate::youtube::mapper::structs::ThumbnailsWrapper;
use crate::youtube::mapper::structs::author::AuthorPhotoWrapper;
use crate::youtube::mapper::structs::author::parse_author_color;
use crate::youtube::mapper::structs::author::parse_author_name_str;
use crate::youtube::mapper::structs::author::parse_author_photo_vec;
use crate::youtube::mapper::structs::author::parse_author_username_str;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct InteractivityWidgetRenderer {
    id: String,
    #[serde(rename = "type")]
    widget_type: String,
    preload_images: Vec<PreloadImage>,
    content: Content,
    position: Position,
    timeout_ms: u64,
    enter_animation: String,
    exit_animation: String,
    priority: i32
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PreloadImage {
    image: ThumbnailsWrapper,
    image_display_width: u32,
    image_display_height: u32
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Content {
    gift_attribution_item_view_model: GiftAttributionItemViewModel,
    element_renderer: ElementRenderer
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct GiftAttributionItemViewModel {
    id: String,
    author_name: TextContent,
    author_avatar: AuthorAvatar,
    detail_text: TextContent,
    attribution_image: SourceImage,
    gift_a11y_label: String
}

#[derive(Serialize, Deserialize, Debug)]
struct TextContent {
    content: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct AuthorAvatar {
    avatar_view_model: AvatarViewModel
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct AvatarViewModel {
    image: AvatarImage,
    avatar_image_size: String
}

#[derive(Serialize, Deserialize, Debug)]
struct AvatarImage {
    sources: Vec<AuthorPhotoWrapper>,
    processor: ImageProcessor
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ImageProcessor {
    border_image_processor: BorderImageProcessor
}

#[derive(Serialize, Deserialize, Debug)]
struct BorderImageProcessor {
    circular: bool
}

#[derive(Serialize, Deserialize, Debug)]
struct SourceImage {
    sources: Vec<Thumbnail>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ElementRenderer {
    compatibility_options: CompatibilityOptions
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct CompatibilityOptions {
    live_chat_id: String,
    live_chat_author_external_channel_id: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Position {
    width: String,
    height: String,
    special_placement: String
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed: InteractivityWidgetRenderer = serde_json::from_value(value)?;

    if parsed.widget_type == "INTERACTIVITY_WIDGET_TYPE_GIFT" {
        let gift = parsed.content.gift_attribution_item_view_model;

        let channel_id = properties::get_item(PropertiesKey::YouTubeChannelId)?;
        let author_id = parsed.content.element_renderer.compatibility_options.live_chat_author_external_channel_id;
        let author_username = parse_author_username_str(gift.author_name.content.clone())?;
        let author_name = parse_author_name_str(gift.author_name.content.clone())?;
        let author_color = parse_author_color(&author_name)?;
        let author_photo = parse_author_photo_vec(&gift.author_avatar.avatar_view_model.image.sources)?;

        let gift_description = Some(gift.detail_text.content);
        let gift_icon_url = gift.attribution_image.sources.last().map(|thumb| thumb.url.clone());

        let message_id = gift.id;

        let timestamp_usec = get_current_timestamp()?;

        let event = UniChatEvent::Gift(UniChatGiftEventPayload {
            channel_id: channel_id,
            channel_name: None,

            platform: UniChatPlatform::YouTube,
            flags: HashMap::new(),

            author_id: author_id,
            author_username: author_username,
            author_display_name: author_name,
            author_display_color: author_color,
            author_badges: Vec::new(),
            author_profile_picture_url: author_photo,
            author_type: None,

            gift_id: None,
            gift_title: None,
            gift_description: gift_description,
            gift_cost: None,
            gift_icon_url: gift_icon_url,

            message_id: message_id,
            message_text: None,
            emotes: Vec::new(),

            timestamp: timestamp_usec
        });

        return Ok(Some(event));
    }

    return Ok(None);
}
