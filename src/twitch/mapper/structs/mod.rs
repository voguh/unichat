/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;

pub mod author;
pub mod message;

const DROPPED_TAGS: [&str; 24] = [
    "badge-info",
    "badges",
    "bits",
    "client-nonce",
    "color",
    "custom-reward-id",
    "display-name",
    "emote-only",
    "emotes",
    "flags",
    "gifs",
    "id",
    "login",
    "mod",
    "msg-id",
    "returning-chatter",
    "room-id",
    "subscriber",
    "system-msg",
    "target-user-id",
    "tmi-sent-ts",
    "turbo",
    "user-id",
    "user-type"
];

const DROPPED_TAG_PREFIXES: [&str; 3] = ["msg-param-", "reply-", "source-"];

const KEPT_REPLY_TAG: &str = "reply-parent-msg-id";

/* <================================================================================================================> */

fn is_dropped(tag: &str) -> bool {
    if tag == KEPT_REPLY_TAG {
        return false;
    }

    if DROPPED_TAGS.contains(&tag) {
        return true;
    }

    return DROPPED_TAG_PREFIXES.iter().any(|prefix| tag.starts_with(prefix));
}

pub fn inject_raw_tags(tags: &HashMap<String, Option<String>>) -> HashMap<String, Option<String>> {
    let mut flags = HashMap::new();

    for (key, value) in tags.iter() {
        if is_dropped(key) {
            continue;
        }

        let key = format!("unichat:raw:twitch:{}", key);

        if let Some(value) = value {
            flags.insert(key, Some(value.to_owned()));
        } else {
            flags.insert(key, None);
        }
    }

    return flags;
}
