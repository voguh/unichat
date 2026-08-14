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
use std::sync::LazyLock;

use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatAuthorType;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatGiftEventPayload;
use crate::events::unichat::UniChatPlatform;
use crate::utils::get_current_timestamp;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;
use crate::youtube::mapper::structs::Thumbnail;
use crate::youtube::mapper::structs::author::AuthorPhotoWrapper;
use crate::youtube::mapper::structs::author::parse_author_color;
use crate::youtube::mapper::structs::author::parse_author_name_str;
use crate::youtube::mapper::structs::author::parse_author_photo_vec;
use crate::youtube::mapper::structs::author::parse_author_username_str;
use crate::youtube::mapper::structs::proxy_youtube_url;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct InteractivityWidgetRenderer {
    content: Content
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
    image: AvatarImage
}

#[derive(Serialize, Deserialize, Debug)]
struct AvatarImage {
    sources: Vec<AuthorPhotoWrapper>
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
    live_chat_author_external_channel_id: String
}

static GIFT_ASSET_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| regex::Regex::new(r"/assets/([^./]+)\.").unwrap());

const GIFT_A11Y_LABEL_SEPARATOR: &str = " sent a gift, ";

// The gift asset filename is the only per-gift discriminator the widget carries, e.g.
// "[...]/assets/pastel.webp=w80-h80" -> "pastel".
//
// It is stable per gift type, but it is not an id issued by YouTube.
fn parse_gift_id(gift: &GiftAttributionItemViewModel) -> Option<String> {
    let url = gift.attribution_image.sources.first()?;
    let captures = GIFT_ASSET_REGEX.captures(&url.url)?;
    return Some(captures.get(1)?.as_str().to_owned());
}

// The widget has no field holding the gift name, so it is approximated from the asset slug:
// "gaming_capybara" -> "Gaming capybara".
fn parse_gift_title(gift_id: &Option<String>) -> Option<String> {
    let slug = gift_id.as_ref()?;
    let spaced = slug.replace('_', " ");

    let mut chars = spaced.chars();
    let first = chars.next()?;

    return Some(format!("{}{}", first.to_uppercase(), chars.as_str()));
}

fn parse_gift_description(gift: &GiftAttributionItemViewModel) -> Option<String> {
    let (_, description) = gift.gift_a11y_label.split_once(GIFT_A11Y_LABEL_SEPARATOR)?;
    let description = description.trim();

    if description.is_empty() {
        return None;
    }

    return Some(description.to_owned());
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let widget_type = value.get("type").and_then(|widget_type| widget_type.as_str());

    if widget_type == Some("INTERACTIVITY_WIDGET_TYPE_GIFT") {
        let parsed: InteractivityWidgetRenderer = serde_json::from_value(value)?;
        let gift = parsed.content.gift_attribution_item_view_model;

        let channel_id = properties::get_item(PropertiesKey::YouTubeChannelId)?;
        let author_id = parsed.content.element_renderer.compatibility_options.live_chat_author_external_channel_id;
        let author_username = parse_author_username_str(gift.author_name.content.clone())?;
        let author_name = parse_author_name_str(gift.author_name.content.clone())?;
        let author_color = parse_author_color(&author_name)?;
        let author_photo = parse_author_photo_vec(&gift.author_avatar.avatar_view_model.image.sources)?;

        let gift_id = parse_gift_id(&gift);
        let gift_title = parse_gift_title(&gift_id);
        let gift_description = parse_gift_description(&gift);
        let gift_icon_url = gift.attribution_image.sources.last().map(|thumb| proxy_youtube_url(&thumb.url));

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
            author_profile_picture_url: Some(author_photo),
            author_type: UniChatAuthorType::Viewer,

            gift_id: gift_id,
            gift_title: gift_title,
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
