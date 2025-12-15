/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

pub mod author;
pub mod message;

pub fn inject_raw_tags(tags: &HashMap<String, Option<String>>) -> HashMap<String, Option<String>> {
    let mut flags = HashMap::new();

    for (key, value) in tags.iter() {
        let key = format!("unichat:raw:twitch:{}", key);

        if let Some(value) = value {
            flags.insert(key, Some(value.to_owned()));
        } else {
            flags.insert(key, None);
        }
    }

    return flags.clone();
}
