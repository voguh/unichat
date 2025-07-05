/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
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
