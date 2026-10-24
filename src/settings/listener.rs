/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::sync::LazyLock;
use std::sync::RwLock;
use std::sync::RwLockReadGuard;

use serde_json::Value;

/* ========================================================================== */

type SettingsChangeListener = Box<dyn Fn(&str, &Value) + Send + Sync>;

static LISTENERS: LazyLock<RwLock<Vec<(String, SettingsChangeListener)>>> = LazyLock::new(|| RwLock::new(Vec::new()));
fn read() -> RwLockReadGuard<'static, Vec<(String, SettingsChangeListener)>> {
    return LISTENERS.read().expect("Settings::LISTENERS lock poisoned");
}

fn write(key: String, listener: SettingsChangeListener) {
    let mut listeners = LISTENERS.write().expect("Settings::LISTENERS lock poisoned");
    listeners.push((key, listener));
}

/* ========================================================================== */

pub fn add_change_listener<F: Fn(&str, &Value) + Send + Sync + 'static>(key: &str, listener: F) {
    write(key.to_string(), Box::new(listener));
}

pub(super) fn notify_change_listeners(key: &str, value: &Value) {
    for (listener_key, listener) in read().iter() {
        if listener_key == key {
            listener(key, value);
        }
    }
}
