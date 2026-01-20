/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use anyhow::Error;

use crate::events::unichat::UniChatEvent;
use crate::utils::irc::IRCMessage;

mod cheer;
mod message;

pub fn parse(channel: String, text: String, message: &IRCMessage) -> Result<Option<UniChatEvent>, Error> {
    let tags = message.tags.clone();

    if tags.get("bits").is_some() {
        return cheer::parse(channel, text, message, tags);
    }

    return message::parse(channel, text, message, tags);
}
