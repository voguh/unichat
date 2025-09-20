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
                if value.trim().is_empty() {
                    continue;
                }

                tags_map.insert(name.clone(), value.clone());
            }
        }
    }

    return tags_map;
}

pub fn inject_raw_tags(tags: &HashMap<String, String>) -> HashMap<String, Option<String>> {
    let mut flags = HashMap::new();

    for (key, value) in tags.iter() {
        let key = format!("unichat:raw:twitch:{}", key);

        if value.trim().is_empty() {
            flags.insert(key, None);
        } else {
            flags.insert(key, Some(value.to_owned()));
        }
    }

    return flags.clone();
}
