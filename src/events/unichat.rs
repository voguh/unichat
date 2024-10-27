use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase", untagged)]
pub enum UniChatEvent {
    Message {
        #[serde(rename = "type")]
        event_type: String,
        detail: UniChatMessageEventPayload
    },
    RemoveMessage {
        #[serde(rename = "type")]
        event_type: String,
        detail: UniChatRemoveMessageEventPayload
    },
    RemoveAuthor {
        #[serde(rename = "type")]
        event_type: String,
        detail: UniChatRemoveAuthorEventPayload
    },
    Raid {
        #[serde(rename = "type")]
        event_type: String,
        detail: UniChatRaidEventPayload
    },
    Sponsor {
        #[serde(rename = "type")]
        event_type: String,
        detail: UniChatSponsorEvent
    },
    SponsorGift {
        #[serde(rename = "type")]
        event_type: String,
        detail: UniChatSponsorGiftEvent
    },
    Donate {
        #[serde(rename = "type")]
        event_type: String,
        detail: UniChatDonateEvent
    }
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatMessageEventPayload {
    pub channel_id: Option<String>,
    pub channel_name: Option<String>,
    pub platform: String,

    pub message_id: String,
    pub message_text: String,
    pub emotes: Vec<UniChatEmote>,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: String,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: String,

    pub timestamp: u64
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatEmote {
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

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRemoveMessageEventPayload {
    pub channel_id: Option<String>,
    pub channel_name: Option<String>,
    pub platform: String,

    pub message_id: String
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRemoveAuthorEventPayload {
    pub channel_id: Option<String>,
    pub channel_name: Option<String>,
    pub platform: String,

    pub author_id: String
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatRaidEventPayload {
    pub channel_id: Option<String>,
    pub channel_name: Option<String>,
    pub platform: String,

    pub author_id: Option<String>,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_profile_picture_url: String,

    pub viewer_count: Option<u16>
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatSponsorEvent {
    pub channel_id: Option<String>,
    pub channel_name: Option<String>,
    pub platform: String,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_profile_picture_url: String,

    pub tier: String,
    pub months: u16,
    pub message: Option<String>
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatSponsorGiftEvent {
    pub channel_id: Option<String>,
    pub channel_name: Option<String>,
    pub platform: String,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_profile_picture_url: String,

    pub tier: String,
    pub count: u16
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UniChatDonateEvent {
    pub channel_id: Option<String>,
    pub channel_name: Option<String>,
    pub platform: String,

    pub author_id: String,
    pub author_username: Option<String>,
    pub author_display_name: String,
    pub author_display_color: String,
    pub author_profile_picture_url: String,
    pub author_badges: Vec<UniChatBadge>,
    pub author_type: String,

    pub value: f32,
    pub currency: String,

    pub message_id: String,
    pub message: String,
    pub emotes: Vec<UniChatEmote>,
}
