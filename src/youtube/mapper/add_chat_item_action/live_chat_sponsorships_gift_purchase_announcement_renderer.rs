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

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatSponsorGiftEventPayload;
use crate::events::unichat::UNICHAT_EVENT_SPONSOR_GIFT_TYPE;
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
use crate::youtube::mapper::structs::message::MessageRun;
use crate::youtube::mapper::structs::message::MessageRunsWrapper;
use crate::youtube::mapper::structs::ThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer {
    id: String,

    author_external_channel_id: String,

    header: Header,

    timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Header {
    live_chat_sponsorships_header_renderer: LiveChatSponsorshipsHeaderRenderer
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatSponsorshipsHeaderRenderer {
    primary_text: MessageRunsWrapper,

    image: ThumbnailsWrapper,

    author_name: AuthorNameWrapper,
    author_photo: AuthorPhotoThumbnailsWrapper,
    author_badges: Option<Vec<AuthorBadgeWrapper>>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RunsWrapper {
    pub runs: Vec<Run>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Run {
    pub text: String
}

fn parse_tier(render: &LiveChatSponsorshipsHeaderRenderer) -> Result<String, Box<dyn std::error::Error>> {
    let run = render.primary_text.runs.get(3).ok_or("No tier run found")?;

    let tier = match run {
        MessageRun::Text { text } => text,
        MessageRun::Emoji { .. } => return Err("Unexpected emoji in tier run".into()),
    };

    return Ok(tier.clone());
}

fn parse_count(render: &LiveChatSponsorshipsHeaderRenderer) -> Result<u16, Box<dyn std::error::Error>> {
    let run = render.primary_text.runs.get(1).ok_or("No count run found")?;
    let raw_count = match run {
        MessageRun::Text { text } => text,
        MessageRun::Emoji { .. } => return Err("Unexpected emoji in count run".into()),
    };

    let count: u16 = raw_count.parse()?;

    return Ok(count);
}

/* <============================================================================================> */

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer = serde_json::from_value(value).map_err(parse_serde_error)?;
    let render = parsed.header.live_chat_sponsorships_header_renderer;
    let author_username = parse_author_username(&render.author_name)?;
    let author_name = parse_author_name(&render.author_name)?;
    let author_color = parse_author_color(&author_name)?;
    let author_badges = parse_author_badges(&render.author_badges)?;
    let author_photo = parse_author_photo(&render.author_photo)?;
    let author_type = parse_author_type(&render.author_badges)?;

    let tier = parse_tier(&render)?;
    let count = parse_count(&render)?;

    let event = UniChatEvent::SponsorGift {
        event_type: String::from(UNICHAT_EVENT_SPONSOR_GIFT_TYPE),
        data: UniChatSponsorGiftEventPayload {
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

            tier: tier,
            count: count,
        }
    };

    return Ok(Some(event));
}
