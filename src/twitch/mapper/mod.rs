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

mod privmsg;
mod raw_clearchat;
mod raw_clearmsg;
mod raw_usernotice;
pub mod structs;

fn parse_channel_name(channel: &String) -> String {
    return channel.replace("#", "");
}

pub fn parse(message: &Message) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    if let Command::PRIVMSG(channel, text) = &message.command {
        let channel_name = parse_channel_name(channel);
        return privmsg::parse(channel_name, text.to_owned(), message);
    } else if let Command::Raw(cmd, payload) = &message.command {
        let channel = payload.get(0).ok_or("Missing channel name")?;
        let channel_name = parse_channel_name(channel);

        if cmd == "CLEARCHAT" {
            return raw_clearchat::parse(channel_name, message);
        } else if cmd == "CLEARMSG" {
            return raw_clearmsg::parse(channel_name, message);
        } else if cmd == "USERNOTICE" {
            return raw_usernotice::parse(channel_name, message);
        }
    }

    return Ok(None);
}
