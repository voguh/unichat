/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRemoveMessageEventPayload;
use crate::events::unichat::UNICHAT_EVENT_REMOVE_MESSAGE_TYPE;
use crate::utils::parse_serde_error;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemAction {
    target_item_id: String
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: RemoveChatItemAction = serde_json::from_value(value).map_err(parse_serde_error)?;

    let timestamp_usec = SystemTime::now().duration_since(UNIX_EPOCH)?;

    let event = UniChatEvent::RemoveMessage {
        event_type: String::from(UNICHAT_EVENT_REMOVE_MESSAGE_TYPE),
        data: UniChatRemoveMessageEventPayload {
            channel_id: properties::get_item(PropertiesKey::YouTubeChannelId)?,
            channel_name: None,
            platform: UniChatPlatform::YouTube,

            message_id: parsed.target_item_id.clone(),

            timestamp: timestamp_usec.as_secs() as i64
        }
    };

    return Ok(Some(event));
}
