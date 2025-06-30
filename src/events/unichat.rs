/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
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

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(untagged)]
pub enum UniChatEvent {
    Load {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatLoadEventPayload
    },
    Clear {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatClearEventPayload
    },
    Message {
        #[serde(rename = "type")]
        event_type: String,
        data: UniChatMessageEventPayload
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
    Moderator,
    Broadcaster
}

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, Hash)]
#[serde(rename_all = "camelCase")]
pub struct UniChatEmote {
    pub id: String,
    #[serde(rename = "type")]
    pub emote_type: String,
    pub tooltip: String,
    pub url: String
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatBadge {
    #[serde(rename = "type")]
    pub badge_type: String,
    pub tooltip: String,
    pub url: String
}
/* <============================================================================================> */

pub const UNICHAT_EVENT_LOAD_TYPE: &str = "unichat:load";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatLoadEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform
}

/* <============================================================================================> */

pub const UNICHAT_EVENT_CLEAR_TYPE: &str = "unichat:clear";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatClearEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform
}

/* <============================================================================================> */

pub const UNICHAT_EVENT_MESSAGE_TYPE: &str = "unichat:message";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatMessageEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: String,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: UniChatAuthorType,

    pub message_id: String,
    pub message_text: String,
    pub emotes: Vec<UniChatEmote>
}


/* <============================================================================================> */

pub const UNICHAT_EVENT_REMOVE_MESSAGE_TYPE: &str = "unichat:remove_message";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRemoveMessageEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform,

    pub message_id: String
}

/* <============================================================================================> */

pub const UNICHAT_EVENT_REMOVE_AUTHOR_TYPE: &str = "unichat:remove_author";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRemoveAuthorEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform,

    pub author_id: String
}

/* <============================================================================================> */

pub const UNICHAT_EVENT_RAID_TYPE: &str = "unichat:raid";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRaidEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform,

    pub author_id: Option<String>,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: String,

    pub message_id: String,
    pub viewer_count: Option<u16>
}

/* <============================================================================================> */

pub const UNICHAT_EVENT_SPONSOR_TYPE: &str = "unichat:sponsor";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatSponsorEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: String,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: UniChatAuthorType,

    pub message_id: String,
    pub tier: Option<String>,
    pub months: u16,
    pub message_text: Option<String>,
    pub emotes: Vec<UniChatEmote>
}

/* <============================================================================================> */

pub const UNICHAT_EVENT_SPONSOR_GIFT_TYPE: &str = "unichat:sponsor_gift";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatSponsorGiftEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: String,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: UniChatAuthorType,

    pub message_id: String,
    pub tier: Option<String>,
    pub count: u16
}

/* <============================================================================================> */

pub const UNICHAT_EVENT_DONATE_TYPE: &str = "unichat:donate";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatDonateEventPayload {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub platform: UniChatPlatform,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: String,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: UniChatAuthorType,

    pub value: f32,
    pub currency: String,

    pub message_id: String,
    pub message_text: Option<String>,
    pub emotes: Vec<UniChatEmote>
}
