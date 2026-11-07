/*!******************************************************************************
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

use crate::events::UniChatEvent;
use crate::events::UniChatPlatform;
use crate::events::UniChatRemoveAuthorEventPayload;
use crate::utils::get_current_timestamp;
use crate::youtube::read_channel_id;

/* ========================================================================== */

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemByAuthorAction {
    external_channel_id: String
}

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed = RemoveChatItemByAuthorAction::deserialize(value)?;

    let channel_id = read_channel_id()?;
    let timestamp_usec = get_current_timestamp();

    let event = UniChatEvent::RemoveAuthor(UniChatRemoveAuthorEventPayload {
        channel_id: channel_id,
        channel_name: None,

        platform: UniChatPlatform::YouTube,
        flags: HashMap::new(),

        author_id: parsed.external_channel_id,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
