/*!******************************************************************************
 * Copyright (c) 2026 Voguh
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

use anyhow::Error;
use anyhow::anyhow;
use mlua::Value;

/* ========================================================================== */

static SHARED_MODULES: LazyLock<RwLock<HashMap<String, Value>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
pub fn get(module_name: &str) -> Option<Value> {
    let shared_modules = SHARED_MODULES.read().expect("Plugins::SHARED_MODULES lock poisoned");
    return shared_modules.get(module_name).cloned();
}

pub fn add(module_name: String, module_table: Value) -> Result<(), Error> {
    let mut shared_modules = SHARED_MODULES.write().expect("Plugins::SHARED_MODULES lock poisoned");
    if shared_modules.contains_key(&module_name) {
        return Err(anyhow!("Module '{}' is already exposed", module_name));
    }

    shared_modules.insert(module_name, module_table);
    return Ok(());
}
