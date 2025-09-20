/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatDonateEventPayload;
use crate::events::unichat::UniChatEmote;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UNICHAT_EVENT_DONATE_TYPE;
use crate::events::unichat::UNICHAT_FLAG_YOUTUBE_SUPER_STICKER;
use crate::utils::normalize_value;
use crate::utils::parse_serde_error;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;
use crate::youtube::mapper::structs::author::parse_author_badges;
use crate::youtube::mapper::structs::author::parse_author_color;
use crate::youtube::mapper::structs::author::parse_author_name;
use crate::youtube::mapper::structs::author::parse_author_photo;
use crate::youtube::mapper::structs::author::parse_author_type;
use crate::youtube::mapper::structs::author::parse_author_username;
use crate::youtube::mapper::structs::author::AuthorBadgeWrapper;
use crate::youtube::mapper::structs::author::AuthorNameWrapper;
use crate::youtube::mapper::structs::author::AuthorPhotoThumbnailsWrapper;
use crate::youtube::mapper::structs::ThumbnailsWrapper;


#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatPaidStickerRenderer {
    id: String,

    author_external_channel_id: String,
    author_name: AuthorNameWrapper,
    author_photo: AuthorPhotoThumbnailsWrapper,
    author_badges: Option<Vec<AuthorBadgeWrapper>>,

    purchase_amount_text: PurchaseAmountText,
    sticker: ThumbnailsWrapper,

    timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PurchaseAmountText {
    simple_text: String
}

/* <============================================================================================> */

fn parse_purchase_amount(purchase_amount_text: &PurchaseAmountText) -> Result<(String, f32), Box<dyn std::error::Error>> {
    let raw_text = &purchase_amount_text.simple_text;

    if let Some(index) = raw_text.find(|c: char| c.is_ascii_digit()) {
        let (currency, value_raw) = raw_text.split_at(index);
        let value = normalize_value(value_raw)?;

        return Ok((currency.to_string(), value));
    }

    return Err("Invalid purchase amount text format".into());
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatPaidStickerRenderer = serde_json::from_value(value).map_err(parse_serde_error)?;
    let author_username = parse_author_username(&parsed.author_name)?;
    let author_name = parse_author_name(&parsed.author_name)?;
    let author_color = parse_author_color(&author_name)?;
    let author_badges = parse_author_badges(&parsed.author_badges, &None)?;
    let author_photo = parse_author_photo(&parsed.author_photo)?;
    let author_type = parse_author_type(&parsed.author_badges)?;
    let (purchase_currency, purchase_value) = parse_purchase_amount(&parsed.purchase_amount_text)?;
    let sticker = parsed.sticker.thumbnails.last().ok_or("No thumbnails found in author photo")?;
    let emotes = vec![
        UniChatEmote {
            id: String::from("sticker"),
            code: String::from("sticker"),
            url: sticker.url.clone()
        }
    ];
    let timestamp_usec = parsed.timestamp_usec.parse::<i64>()?;

    let event = UniChatEvent::Donate {
        event_type: String::from(UNICHAT_EVENT_DONATE_TYPE),
        data: UniChatDonateEventPayload {
            channel_id: properties::get_item(PropertiesKey::YouTubeChannelId)?,
            channel_name: None,

            platform: UniChatPlatform::YouTube,
            flags: HashMap::from([(String::from(UNICHAT_FLAG_YOUTUBE_SUPER_STICKER), None)]),

            author_id: parsed.author_external_channel_id,
            author_username: author_username,
            author_display_name: author_name,
            author_display_color: author_color,
            author_badges: author_badges,
            author_profile_picture_url: Some(author_photo),
            author_type: author_type,

            value: purchase_value,
            currency: purchase_currency,

            message_id: parsed.id,
            message_text: Some(String::from("sticker")),
            emotes: emotes,

            timestamp: timestamp_usec
        }
    };

    return Ok(Some(event));
}
