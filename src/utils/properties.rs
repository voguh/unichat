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
use std::sync::LazyLock;
use std::sync::RwLock;
use std::sync::RwLockReadGuard;
use std::sync::RwLockWriteGuard;

use anyhow::Error;
use anyhow::anyhow;

/* ========================================================================== */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PropertiesKey {
    YouTubeChannelId,
    TwitchChannelId
}

/* ========================================================================== */

static INSTANCE: LazyLock<RwLock<HashMap<String, String>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
fn read() -> RwLockReadGuard<'static, HashMap<String, String>> {
    return INSTANCE.read().expect("Properties::INSTANCE lock poisoned");
}

fn write() -> RwLockWriteGuard<'static, HashMap<String, String>> {
    return INSTANCE.write().expect("Properties::INSTANCE lock poisoned");
}

/* ========================================================================== */

fn serialize_key<S: serde::ser::Serialize>(key: S) -> String {
    if let Ok(key_str) = serde_plain::to_string(&key) {
        return key_str;
    } else {
        panic!("Failed to serialize PropertiesKey");
    }
}

pub fn get_item(key: PropertiesKey) -> Result<String, Error> {
    let props = read();
    let key = serialize_key(key);

    if let Some(value) = props.get(&key) {
        return Ok(value.clone());
    } else {
        return Err(anyhow!("Property key '{}' not found", key));
    }
}

pub fn set_item(key: PropertiesKey, value: String) {
    let mut properties = write();
    properties.insert(serialize_key(key), value);
}
