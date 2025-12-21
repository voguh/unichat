/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use serde::Deserialize;
use serde::Serialize;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(tag = "type", content = "data")]
pub enum UniChatEvent {
    #[serde(rename = "unichat:clear")]
    Clear(UniChatClearEventPayload),
    #[serde(rename = "unichat:remove_message")]
    RemoveMessage(UniChatRemoveMessageEventPayload),
    #[serde(rename = "unichat:remove_author")]
    RemoveAuthor(UniChatRemoveAuthorEventPayload),
    #[serde(rename = "unichat:message")]
    Message(UniChatMessageEventPayload),
    #[serde(rename = "unichat:donate")]
    Donate(UniChatDonateEventPayload),
    #[serde(rename = "unichat:sponsor")]
    Sponsor(UniChatSponsorEventPayload),
    #[serde(rename = "unichat:sponsor_gift")]
    SponsorGift(UniChatSponsorGiftEventPayload),
    #[serde(rename = "unichat:raid")]
    Raid(UniChatRaidEventPayload),
    #[serde(rename = "unichat:redemption")]
    Redemption(UniChatRedemptionEventPayload),
    #[serde(rename = "unichat:custom")]
    Custom(serde_json::Value)
}

/* <============================================================================================> */

pub const UNICHAT_FLAG_YOUTUBE_SUPER_STICKER: &str = "unichat:youtube_super_sticker";
pub const UNICHAT_FLAG_YOUTUBE_SUPERCHAT_TIER: &str = "unichat:youtube_superchat_tier";

pub const UNICHAT_FLAG_YOUTUBE_SUPERCHAT_PRIMARY_BACKGROUND_COLOR: &str = "unichat:youtube_superchat_primary_background_color";
pub const UNICHAT_FLAG_YOUTUBE_SUPERCHAT_PRIMARY_TEXT_COLOR: &str = "unichat:youtube_superchat_primary_text_color";

pub const UNICHAT_FLAG_YOUTUBE_SUPERCHAT_SECONDARY_BACKGROUND_COLOR: &str = "unichat:youtube_superchat_secondary_background_color";
pub const UNICHAT_FLAG_YOUTUBE_SUPERCHAT_SECONDARY_TEXT_COLOR: &str = "unichat:youtube_superchat_secondary_text_color";

/* <============================================================================================> */

#[derive(Clone, Debug)]
pub enum UniChatPlatform {
    YouTube,
    Twitch,
    Other(String)
}

impl Serialize for UniChatPlatform {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let s = match self {
            UniChatPlatform::YouTube => "youtube",
            UniChatPlatform::Twitch => "twitch",
            UniChatPlatform::Other(v) => v.as_str()
        };

        return serializer.serialize_str(s);
    }
}

impl <'de> Deserialize<'de> for UniChatPlatform {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let s = String::deserialize(deserializer)?;
        let normalized = s.to_lowercase();

        return Ok(match normalized.as_str() {
            "youtube" => UniChatPlatform::YouTube,
            "twitch" => UniChatPlatform::Twitch,
            _ => UniChatPlatform::Other(normalized)
        });
    }
}

#[derive(Clone, Debug)]
pub enum UniChatAuthorType {
    Viewer,
    Sponsor,
    Vip,
    Moderator,
    Broadcaster,
    Other(String)
}

impl Serialize for UniChatAuthorType {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let s = match self {
            UniChatAuthorType::Viewer => "VIEWER",
            UniChatAuthorType::Sponsor => "SPONSOR",
            UniChatAuthorType::Vip => "VIP",
            UniChatAuthorType::Moderator => "MODERATOR",
            UniChatAuthorType::Broadcaster => "BROADCASTER",
            UniChatAuthorType::Other(v) => v.as_str()
        };

        return serializer.serialize_str(s);
    }
}

impl <'de> Deserialize<'de> for UniChatAuthorType {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let s = String::deserialize(deserializer)?;
        let normalized = s.to_uppercase();

        return Ok(match normalized.as_str() {
            "VIEWER" => UniChatAuthorType::Viewer,
            "SPONSOR" | "SUBSCRIBER" | "MEMBER" => UniChatAuthorType::Sponsor,
            "VIP" => UniChatAuthorType::Vip,
            "MODERATOR" => UniChatAuthorType::Moderator,
            "BROADCASTER" => UniChatAuthorType::Broadcaster,
            _ => UniChatAuthorType::Other(normalized)
        });
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, Hash)]
#[serde(rename_all = "camelCase")]
pub struct UniChatEmote {
    pub id: String,
    pub code: String,
    pub url: String
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatBadge {
    pub code: String,
    pub url: String
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatClearEventPayload {
    pub platform: Option<UniChatPlatform>,

    pub timestamp: i64
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRemoveMessageEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform,

    pub message_id: String,

    pub timestamp: i64
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRemoveAuthorEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform,

    pub author_id: String,

    pub timestamp: i64
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatMessageEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,

    pub platform: UniChatPlatform,
    pub flags: HashMap<String, Option<String>>,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: Option<String>,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: UniChatAuthorType,

    pub message_id: String,
    pub message_text: String,
    pub emotes: Vec<UniChatEmote>,

    pub timestamp: i64
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatDonateEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,

    pub platform: UniChatPlatform,
    pub flags: HashMap<String, Option<String>>,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: Option<String>,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: UniChatAuthorType,

    pub value: f32,
    pub currency: String,

    pub message_id: String,
    pub message_text: Option<String>,
    pub emotes: Vec<UniChatEmote>,

    pub timestamp: i64
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatSponsorEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,

    pub platform: UniChatPlatform,
    pub flags: HashMap<String, Option<String>>,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: Option<String>,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: UniChatAuthorType,

    pub tier: Option<String>,
    pub months: u16,

    pub message_id: String,
    pub message_text: Option<String>,
    pub emotes: Vec<UniChatEmote>,

    pub timestamp: i64
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatSponsorGiftEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,

    pub platform: UniChatPlatform,
    pub flags: HashMap<String, Option<String>>,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: Option<String>,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: UniChatAuthorType,

    pub message_id: String,
    pub tier: Option<String>,
    pub count: u16,

    pub timestamp: i64
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRaidEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,

    pub platform: UniChatPlatform,
    pub flags: HashMap<String, Option<String>>,

    pub author_id: Option<String>,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: String,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: Option<UniChatAuthorType>,

    pub message_id: String,
    pub viewer_count: Option<u16>,

    pub timestamp: i64
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRedemptionEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,

    pub platform: UniChatPlatform,
    pub flags: HashMap<String, Option<String>>,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: Option<String>,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: Option<UniChatAuthorType>,

    pub reward_id: String,
    pub reward_title: String,
    pub reward_description: Option<String>,
    pub reward_cost: u32,
    pub reward_icon_url: String,

    pub message_id: String,
    pub message_text: Option<String>,
    pub emotes: Vec<UniChatEmote>,

    pub timestamp: i64
}
