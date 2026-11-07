/*!******************************************************************************
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

use crate::currency;
use crate::events::FLAG_YOUTUBE_SUPERCHAT_PRIMARY_BG_COLOR;
use crate::events::FLAG_YOUTUBE_SUPERCHAT_PRIMARY_TEXT_COLOR;
use crate::events::FLAG_YOUTUBE_SUPERCHAT_SECONDARY_BG_COLOR;
use crate::events::FLAG_YOUTUBE_SUPERCHAT_SECONDARY_TEXT_COLOR;
use crate::events::FLAG_YOUTUBE_SUPERCHAT_TIER;
use crate::events::UniChatDonateEventPayload;
use crate::events::UniChatEvent;
use crate::events::UniChatPlatform;
use crate::utils::get_current_timestamp;
use crate::youtube::mapper::structs::PurchaseAmountText;
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
use crate::youtube::mapper::structs::parse_purchase_amount;
use crate::youtube::read_channel_id;

/* ========================================================================== */

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
    body_text_color: Option<u32>
}

/* ========================================================================== */

fn parse_u32_to_rgba(color: u32) -> (u8, u8, u8, f32) {
    let a = ((color >> 24) & 0xFF) as u8;
    let r = ((color >> 16) & 0xFF) as u8;
    let g = ((color >> 8) & 0xFF) as u8;
    let b = (color & 0xFF) as u8;

    return (r, g, b, a as f32 / 255.0);
}

fn create_flags_map(parsed: &LiveChatPaidMessageRenderer) -> HashMap<String, Option<String>> {
    let mut flags = HashMap::new();

    /* ====================================================================== */

    if let Some(body_background_color) = parsed.body_background_color {
        let (r, g, b, a) = parse_u32_to_rgba(body_background_color);
        let rgba = format!("rgba({}, {}, {}, {:.3})", r, g, b, a);
        flags.insert(FLAG_YOUTUBE_SUPERCHAT_PRIMARY_BG_COLOR.to_string(), Some(rgba.clone()));

        let tier = parse_super_chat_tier(&rgba);
        flags.insert(FLAG_YOUTUBE_SUPERCHAT_TIER.to_string(), tier.map(|t| t.to_string()));
    }

    if let Some(body_text_color) = parsed.body_text_color {
        let (r, g, b, a) = parse_u32_to_rgba(body_text_color);
        let rgba = format!("rgba({}, {}, {}, {:.3})", r, g, b, a);
        flags.insert(FLAG_YOUTUBE_SUPERCHAT_PRIMARY_TEXT_COLOR.to_string(), Some(rgba));
    }

    /* ====================================================================== */

    if let Some(header_background_color) = parsed.header_background_color {
        let (r, g, b, a) = parse_u32_to_rgba(header_background_color);
        let rgba = format!("rgba({}, {}, {}, {:.3})", r, g, b, a);
        flags.insert(FLAG_YOUTUBE_SUPERCHAT_SECONDARY_BG_COLOR.to_string(), Some(rgba));
    }

    if let Some(header_text_color) = parsed.header_text_color {
        let (r, g, b, a) = parse_u32_to_rgba(header_text_color);
        let rgba = format!("rgba({}, {}, {}, {:.3})", r, g, b, a);
        flags.insert(FLAG_YOUTUBE_SUPERCHAT_SECONDARY_TEXT_COLOR.to_string(), Some(rgba));
    }

    /* ====================================================================== */

    return flags;
}

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed = LiveChatPaidMessageRenderer::deserialize(value)?;

    let channel_id = read_channel_id()?;
    let flags = create_flags_map(&parsed);
    let author_id = parsed.author_external_channel_id;
    let author_username = parse_author_username(&parsed.author_name);
    let author_name = parse_author_name(&parsed.author_name);
    let author_color = parse_author_color(&author_name);
    let author_badges = parse_author_badges(&parsed.author_badges, &None)?;
    let author_photo = parse_author_photo(&parsed.author_photo)?;
    let author_type = parse_author_type(&parsed.author_badges);
    let (purchase_currency, purchase_value) = parse_purchase_amount(&parsed.purchase_amount_text)?;
    let converted = currency::apply(purchase_value, &purchase_currency);
    let (donate_value, donate_currency, original_value, original_currency) = converted;
    let message = parsed.message.as_ref().map(parse_message_string).transpose()?;
    let emotes = parsed.message.as_ref().map(parse_message_emojis).transpose()?.unwrap_or_default();
    let timestamp_usec = get_current_timestamp();

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

        value: donate_value,
        currency: donate_currency,

        original_value: original_value,
        original_currency: original_currency,

        message_id: parsed.id,
        message_text: message,
        emotes: emotes,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
