/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use irc::client::prelude::*;

use crate::events::unichat::UniChatEvent;
use crate::twitch::mapper::structs::parse_tags;

mod cheer;
mod message;

pub fn parse(channel: String, text: String, message: &Message) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let tags = parse_tags(&message.tags);

    if tags.get("bits").is_some() {
        return cheer::parse(channel, text, message, tags);
    }

    return message::parse(channel, text, message, tags);
}
