/*!******************************************************************************
 * UniChat
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
