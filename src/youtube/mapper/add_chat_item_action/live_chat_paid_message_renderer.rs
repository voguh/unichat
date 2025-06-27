/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatDonateEventPayload;
use crate::events::unichat::UniChatEmote;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UNICHAT_EVENT_DONATE_TYPE;
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
struct LiveChatPaidMessageRenderer {
    id: String,

    purchase_amount_text: PurchaseAmountText,
    message: Option<MessageRunsWrapper>,

    author_external_channel_id: String,
    author_name: AuthorNameWrapper,
    author_photo: AuthorPhotoThumbnailsWrapper,
    author_badges: Option<Vec<AuthorBadgeWrapper>>,

    timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PurchaseAmountText {
    simple_text: String
}

/* <============================================================================================> */

fn parse_purchase_amount(purchase_amount_text: &PurchaseAmountText) -> Result<(String, f32), Box<dyn std::error::Error>> {
    let mut raw_value = String::from("");
    let mut currency = String::from("");

    for ch in purchase_amount_text.simple_text.chars().rev() {
        if ch.is_numeric() || ch == '.' || ch == ',' {
            if ch.is_numeric() || ch == '.' {
                raw_value.insert(0, ch);
            }
        } else {
            currency.insert(0, ch);
        }
    }

    let value: f32 = raw_value.parse()?;

    return Ok((currency, value));
}

fn build_option_message(message: &Option<MessageRunsWrapper>) -> Result<Option<String>, Box<dyn std::error::Error>> {
    if let Some(message) = message {
        let message_text = parse_message_string(message)?;
        return Ok(Some(message_text));
    }

    return Ok(None);
}

fn build_option_emotes(message: &Option<MessageRunsWrapper>) -> Result<Option<Vec<UniChatEmote>>, Box<dyn std::error::Error>> {
    if let Some(message) = message {
        let emotes = parse_message_emojis(message)?;
        return Ok(Some(emotes));
    }

    return Ok(None);
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatPaidMessageRenderer = serde_json::from_value(value).map_err(parse_serde_error)?;
    let author_username = parse_author_username(&parsed.author_name)?;
    let author_name = parse_author_name(&parsed.author_name)?;
    let author_color = parse_author_color(&author_name)?;
    let author_badges = parse_author_badges(&parsed.author_badges)?;
    let author_photo = parse_author_photo(&parsed.author_photo)?;
    let author_type = parse_author_type(&parsed.author_badges)?;

    let (purchase_currency, purchase_value) = parse_purchase_amount(&parsed.purchase_amount_text)?;
    let message = build_option_message(&parsed.message)?;
    let emotes = build_option_emotes(&parsed.message)?;

    let event = UniChatEvent::Donate {
        event_type: String::from(UNICHAT_EVENT_DONATE_TYPE),
        data: UniChatDonateEventPayload {
            channel_id: properties::get_item(PropertiesKey::YouTubeChannelId)?,
            channel_name: None,
            platform: UniChatPlatform::YouTube,

            author_id: parsed.author_external_channel_id,
            author_username: author_username,
            author_display_name: author_name,
            author_display_color: author_color,
            author_badges: author_badges,
            author_profile_picture_url: author_photo,
            author_type: author_type,

            value: purchase_value,
            currency: purchase_currency,

            message_id: parsed.id,
            message_text: message,
            emotes: emotes
        }
    };

    return Ok(Some(event));
}
