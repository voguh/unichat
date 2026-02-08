/*!******************************************************************************
 * UniChat
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
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
