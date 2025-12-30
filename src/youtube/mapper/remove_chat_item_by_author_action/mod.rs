/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRemoveAuthorEventPayload;
use crate::utils::get_current_timestamp;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemByAuthorAction {
    external_channel_id: String
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed: RemoveChatItemByAuthorAction = serde_json::from_value(value)?;

    let channel_id = properties::get_item(PropertiesKey::YouTubeChannelId)?;
    let timestamp_usec = get_current_timestamp()?;

    let event = UniChatEvent::RemoveAuthor(UniChatRemoveAuthorEventPayload {
        channel_id: channel_id,
        channel_name: None,

        platform: UniChatPlatform::YouTube,
        flags: HashMap::new(),

        author_id: parsed.external_channel_id.clone(),

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
