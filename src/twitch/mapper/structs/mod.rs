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

use std::collections::HashMap;

use irc::proto::message::Tag;

pub mod author;
pub mod message;

pub fn parse_tags(tags: &Option<Vec<Tag>>) -> HashMap<String, String> {
    let mut tags_map = HashMap::new();

    if let Some(tags) = tags {
        for Tag(name, value) in tags {
            if let Some(value) = value {
                tags_map.insert(name.clone(), value.clone());
            }
        }
    }

    return tags_map;
}
