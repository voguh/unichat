/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
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
