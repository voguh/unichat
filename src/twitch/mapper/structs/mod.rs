/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
