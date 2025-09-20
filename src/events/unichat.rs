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
#[serde(untagged)]
pub enum UniChatEvent {
    Clear {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatClearEventPayload
    },
    RemoveMessage {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatRemoveMessageEventPayload
    },
    RemoveAuthor {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatRemoveAuthorEventPayload
    },
    Message {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatMessageEventPayload
    },
    Raid {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatRaidEventPayload
    },
    Sponsor {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatSponsorEventPayload
    },
    SponsorGift {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatSponsorGiftEventPayload
    },
    Donate {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatDonateEventPayload
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "lowercase")]
pub enum UniChatPlatform {
    YouTube,
    Twitch
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "UPPERCASE")]
pub enum UniChatAuthorType {
    Viewer,
    Sponsor,
    Vip,
    Moderator,
    Broadcaster
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

pub const UNICHAT_EVENT_CLEAR_TYPE: &str = "unichat:clear";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatClearEventPayload {
    pub platform: Option<UniChatPlatform>,

    pub timestamp: i64
}

/* <============================================================================================> */

pub const UNICHAT_EVENT_REMOVE_MESSAGE_TYPE: &str = "unichat:remove_message";

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

pub const UNICHAT_EVENT_REMOVE_AUTHOR_TYPE: &str = "unichat:remove_author";

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

pub const UNICHAT_EVENT_MESSAGE_TYPE: &str = "unichat:message";

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

pub const UNICHAT_EVENT_RAID_TYPE: &str = "unichat:raid";

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

pub const UNICHAT_EVENT_SPONSOR_TYPE: &str = "unichat:sponsor";

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

pub const UNICHAT_EVENT_SPONSOR_GIFT_TYPE: &str = "unichat:sponsor_gift";

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

pub const UNICHAT_EVENT_DONATE_TYPE: &str = "unichat:donate";

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
