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

use crate::error::Error;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRemoveAuthorEventPayload;
use crate::events::unichat::UNICHAT_EVENT_REMOVE_AUTHOR_TYPE;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemByAuthorAction {
    external_channel_id: String
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed: RemoveChatItemByAuthorAction = serde_json::from_value(value)?;

    let timestamp_usec = SystemTime::now().duration_since(UNIX_EPOCH)?;

    let event = UniChatEvent::RemoveAuthor {
        event_type: String::from(UNICHAT_EVENT_REMOVE_AUTHOR_TYPE),
        data: UniChatRemoveAuthorEventPayload {
            channel_id: properties::get_item(PropertiesKey::YouTubeChannelId)?,
            channel_name: None,
            platform: UniChatPlatform::YouTube,

            author_id: parsed.external_channel_id.clone(),

            timestamp: timestamp_usec.as_secs() as i64
        }
    };

    return Ok(Some(event));
}
