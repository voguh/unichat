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

use crate::events::unichat::UNICHAT_FLAG_YOUTUBE_SUPERCHAT_PRIMARY_BACKGROUND_COLOR;
use crate::events::unichat::UNICHAT_FLAG_YOUTUBE_SUPERCHAT_PRIMARY_TEXT_COLOR;
use crate::events::unichat::UNICHAT_FLAG_YOUTUBE_SUPERCHAT_SECONDARY_BACKGROUND_COLOR;
use crate::events::unichat::UNICHAT_FLAG_YOUTUBE_SUPERCHAT_SECONDARY_TEXT_COLOR;
use crate::events::unichat::UNICHAT_FLAG_YOUTUBE_SUPERCHAT_TIER;
use crate::events::unichat::UniChatDonateEventPayload;
use crate::events::unichat::UniChatEmote;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::utils;
use crate::utils::get_current_timestamp;
use crate::utils::normalize_value;
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
use crate::youtube::mapper::structs::message::MessageRunsWrapper;
use crate::youtube::mapper::structs::message::parse_message_emojis;
use crate::youtube::mapper::structs::message::parse_message_string;
use crate::youtube::mapper::structs::message::parse_super_chat_tier;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatPaidMessageRenderer {
    id: String,

    author_external_channel_id: String,
    author_name: AuthorNameWrapper,
    author_photo: AuthorPhotoThumbnailsWrapper,
    author_badges: Option<Vec<AuthorBadgeWrapper>>,

    purchase_amount_text: PurchaseAmountText,
    message: Option<MessageRunsWrapper>,

    // ARGB background color
    header_background_color: Option<u32>,
    header_text_color: Option<u32>,
    body_background_color: Option<u32>,
    body_text_color: Option<u32>,

    timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PurchaseAmountText {
    simple_text: String
}

/* <============================================================================================> */

fn parse_purchase_amount(purchase_amount_text: &PurchaseAmountText) -> Result<(String, f32), Error> {
    let raw_text = &purchase_amount_text.simple_text;

    if let Some(index) = raw_text.find(|c: char| c.is_ascii_digit()) {
        let (currency, value_raw) = raw_text.split_at(index);
        let value = normalize_value(value_raw)?;

        return Ok((currency.to_string(), value));
    }

    return Err(anyhow!("Invalid purchase amount text format"));
}

fn build_option_message(message: &Option<MessageRunsWrapper>) -> Result<Option<String>, Error> {
    if let Some(message) = message {
        let message_text = parse_message_string(message)?;
        return Ok(Some(message_text));
    }

    return Ok(None);
}

fn build_option_emotes(message: &Option<MessageRunsWrapper>) -> Result<Vec<UniChatEmote>, Error> {
    if let Some(message) = message {
        let emotes = parse_message_emojis(message)?;
        return Ok(emotes);
    }

    return Ok(Vec::new());
}

fn create_flags_map(parsed: & LiveChatPaidMessageRenderer) -> HashMap<String, Option<String>> {
    let mut flags = HashMap::new();

    /* ====================================================================== */

    if let Some(body_background_color) = parsed.body_background_color {
        let (r, g, b, a) = utils::parse_u32_to_rgba(body_background_color);
        let rgba = format!("rgba({}, {}, {}, {:.3})", r, g, b, a);
        flags.insert(UNICHAT_FLAG_YOUTUBE_SUPERCHAT_PRIMARY_BACKGROUND_COLOR.to_string(), Some(rgba.clone()));

        let tier = parse_super_chat_tier(&rgba);
        flags.insert(UNICHAT_FLAG_YOUTUBE_SUPERCHAT_TIER.to_string(), tier.map(|t| t.to_string()));
    }

    if let Some(body_text_color) = parsed.body_text_color {
        let (r, g, b, a) = utils::parse_u32_to_rgba(body_text_color);
        let rgba = format!("rgba({}, {}, {}, {:.3})", r, g, b, a);
        flags.insert(UNICHAT_FLAG_YOUTUBE_SUPERCHAT_PRIMARY_TEXT_COLOR.to_string(), Some(rgba));
    }

    /* ====================================================================== */

    if let Some(header_background_color) = parsed.header_background_color {
        let (r, g, b, a) = utils::parse_u32_to_rgba(header_background_color);
        let rgba = format!("rgba({}, {}, {}, {:.3})", r, g, b, a);
        flags.insert(UNICHAT_FLAG_YOUTUBE_SUPERCHAT_SECONDARY_BACKGROUND_COLOR.to_string(), Some(rgba));
    }

    if let Some(header_text_color) = parsed.header_text_color {
        let (r, g, b, a) = utils::parse_u32_to_rgba(header_text_color);
        let rgba = format!("rgba({}, {}, {}, {:.3})", r, g, b, a);
        flags.insert(UNICHAT_FLAG_YOUTUBE_SUPERCHAT_SECONDARY_TEXT_COLOR.to_string(), Some(rgba));
    }

    /* ====================================================================== */

    return flags;
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed: LiveChatPaidMessageRenderer = serde_json::from_value(value)?;

    let channel_id = properties::get_item(PropertiesKey::YouTubeChannelId)?;
    let flags = create_flags_map(&parsed);
    let author_id = parsed.author_external_channel_id;
    let author_username = parse_author_username(&parsed.author_name)?;
    let author_name = parse_author_name(&parsed.author_name)?;
    let author_color = parse_author_color(&author_name)?;
    let author_badges = parse_author_badges(&parsed.author_badges, &None)?;
    let author_photo = parse_author_photo(&parsed.author_photo)?;
    let author_type = parse_author_type(&parsed.author_badges)?;
    let (purchase_currency, purchase_value) = parse_purchase_amount(&parsed.purchase_amount_text)?;
    let message = build_option_message(&parsed.message)?;
    let emotes = build_option_emotes(&parsed.message)?;
    let timestamp_usec = get_current_timestamp()?;


    let event = UniChatEvent::Donate(UniChatDonateEventPayload {
        channel_id: channel_id,
        channel_name: None,

        platform: UniChatPlatform::YouTube,
        flags: flags,

        author_id: author_id,
        author_username: author_username,
        author_display_name: author_name,
        author_display_color: author_color,
        author_badges: author_badges,
        author_profile_picture_url: Some(author_photo),
        author_type: author_type,

        value: purchase_value,
        currency: purchase_currency,

        message_id: parsed.id,
        message_text: message,
        emotes: emotes,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
