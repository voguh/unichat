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
use std::sync::RwLockReadGuard;
use std::sync::RwLockWriteGuard;

use anyhow::anyhow;
use anyhow::Error;

/* ========================================================================== */

static SHARED_MODULES: LazyLock<RwLock<HashMap<String, mlua::Value>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
fn read() -> RwLockReadGuard<'static, HashMap<String, mlua::Value>> {
    return SHARED_MODULES.read().expect("Plugins::SHARED_MODULES lock poisoned");
}

fn write() -> RwLockWriteGuard<'static, HashMap<String, mlua::Value>> {
    return SHARED_MODULES.write().expect("Plugins::SHARED_MODULES lock poisoned");
}

/* ========================================================================== */

pub fn get(module_name: &str) -> Result<Option<mlua::Value>, Error> {
    if module_name.is_empty() || !module_name.contains(":") {
        return Err(anyhow!("Invalid module name '{}'. Module names must be in the format 'plugin_name:module_name'", module_name));
    }

    let shared_modules = read();
    return Ok(shared_modules.get(module_name).cloned());
}

pub fn add(module_name: String, module_table: mlua::Value) -> Result<(), Error> {
    if module_name.is_empty() || !module_name.contains(":") {
        return Err(anyhow!("Invalid module name '{}'. Module names must be in the format 'plugin_name:module_name'", module_name));
    }

    let mut shared_modules = write();
    if shared_modules.contains_key(&module_name) {
        return Err(anyhow!("Module '{}' is already exposed", module_name));
    }

    shared_modules.insert(module_name, module_table);
    return Ok(());
}

pub fn remove(module_name: &str) -> Result<(), Error> {
    if module_name.is_empty() || !module_name.contains(":") {
        return Err(anyhow!("Invalid module name '{}'. Module names must be in the format 'plugin_name:module_name'", module_name));
    }

    let mut shared_modules = write();
    if !shared_modules.contains_key(module_name) {
        return Err(anyhow!("Module '{}' is not exposed", module_name));
    }

    shared_modules.remove(module_name);
    return Ok(());
}

pub fn clear() {
    let mut shared_modules = write();
    shared_modules.clear();
}
