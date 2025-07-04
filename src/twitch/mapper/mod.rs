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
pub mod structs;

pub fn parse(message: &Message) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    if let Command::PRIVMSG(channel, text) = &message.command {
        return privmsg::parse(channel.to_owned(), text.to_owned(), message);
    }

    return Ok(None);
}
