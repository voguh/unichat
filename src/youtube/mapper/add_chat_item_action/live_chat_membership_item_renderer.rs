/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::sync::LazyLock;

use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEmote;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatSponsorEventPayload;
use crate::events::unichat::UNICHAT_EVENT_SPONSOR_TYPE;
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
use crate::youtube::mapper::structs::message::MessageRun;
use crate::youtube::mapper::structs::message::MessageRunsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatMembershipItemRenderer {
    id: String,

    author_external_channel_id: String,
    author_name: AuthorNameWrapper,
    author_photo: AuthorPhotoThumbnailsWrapper,
    author_badges: Option<Vec<AuthorBadgeWrapper>>,

    header_primary_text: Option<MessageRunsWrapper>,
    header_subtext: HeaderSubtext,
    message: Option<MessageRunsWrapper>,

    timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct HeaderSubtext {
    simple_text: Option<String>,
    runs: Option<Vec<MessageRun>>
}

/* <============================================================================================> */

// Following the examples 7 and 8, when headerSubtext contains a simpleText, it is the tier
// of the membership.
fn parse_tier(parsed: &LiveChatMembershipItemRenderer) -> Result<Option<String>, Box<dyn std::error::Error>> {
    let mut tier = None;

    if let Some(simple_text) = &parsed.header_subtext.simple_text {
        tier = Some(simple_text.clone());
    } else if let Some(runs) = &parsed.header_subtext.runs {
        let run = runs.get(1).ok_or("No second run found in header primary text")?;
        match run {
            MessageRun::Text { text } => {
                tier = Some(text.clone());
            }
            MessageRun::Emoji { .. } => return Err("Unexpected emoji in header subtext".into())
        }
    }

    return Ok(tier);
}

static MONTHS_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| regex::Regex::new(r"\d+").unwrap());

// I was able to detect two types of membership events (examples 7 and 8).
// The event without a message and with 'runs' in the headerSubtext I am assuming is the first month
// of membership. On the other hand, the event where the 'runs' is in the headerPrimaryText contains
// information that allows detecting the number of months of the membership.
//
// Some times the headerPrimaryText contains only one run with all text, so I'm try to get the second run
// if it exists, otherwise I will try to get the first run.
// Also to extract the number of months, I am using a regex to find the first number in the text.
fn parse_months(parsed: &LiveChatMembershipItemRenderer) -> Result<u16, Box<dyn std::error::Error>> {
    let mut months: u16 = 0;

    if let Some(header_primary_text) = &parsed.header_primary_text {
        let run = header_primary_text.runs.get(1)
            .or_else(|| header_primary_text.runs.get(0))
            .ok_or("No valid run found in header primary text")?;

        match run {
            MessageRun::Text { text } => {
                let value_raw = MONTHS_REGEX.find(text.trim())
                    .ok_or("Failed to find months in header primary text")?;

                months = value_raw.as_str().parse()?;
            },
            MessageRun::Emoji { .. } => return Err("Unexpected emoji in header subtext".into())
        }
    } else if let Some(_runs) = &parsed.header_subtext.runs {
        months = 1
    }

    return Ok(months);
}

fn optional_build_message(message: &Option<MessageRunsWrapper>) -> Result<Option<String>, Box<dyn std::error::Error>> {
    if let Some(message_runs) = message {
        let message = parse_message_string(message_runs)?;
        return Ok(Some(message));
    }

    return Ok(None);
}

fn optional_build_emotes(message: &Option<MessageRunsWrapper>) -> Result<Vec<UniChatEmote>, Box<dyn std::error::Error>> {
    if let Some(message_runs) = message {
        let emotes = parse_message_emojis(message_runs)?;
        return Ok(emotes);
    }

    return Ok(Vec::new());
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatMembershipItemRenderer = serde_json::from_value(value).map_err(parse_serde_error)?;
    let author_username = parse_author_username(&parsed.author_name)?;
    let author_name = parse_author_name(&parsed.author_name)?;
    let author_color = parse_author_color(&author_name)?;
    let author_badges = parse_author_badges(&parsed.author_badges, &None)?;
    let author_photo = parse_author_photo(&parsed.author_photo)?;
    let author_type = parse_author_type(&parsed.author_badges)?;
    let tier = parse_tier(&parsed)?;
    let months = parse_months(&parsed)?;
    let message = optional_build_message(&parsed.message)?;
    let emotes = optional_build_emotes(&parsed.message)?;
    let timestamp_usec = parsed.timestamp_usec.parse::<i64>()?;

    let event = UniChatEvent::Sponsor {
        event_type: String::from(UNICHAT_EVENT_SPONSOR_TYPE),
        data: UniChatSponsorEventPayload {
            channel_id: properties::get_item(PropertiesKey::YouTubeChannelId)?,
            channel_name: None,

            platform: UniChatPlatform::YouTube,
            flags: HashMap::new(),

            author_id: parsed.author_external_channel_id,
            author_username: author_username,
            author_display_name: author_name,
            author_display_color: author_color,
            author_badges: author_badges,
            author_profile_picture_url: Some(author_photo),
            author_type: author_type,

            tier: tier,
            months: months,

            message_id: parsed.id,
            message_text: message,
            emotes: emotes,

            timestamp: timestamp_usec
        }
    };

    return Ok(Some(event));
}
