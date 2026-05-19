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

use anyhow::anyhow;
use anyhow::Error;

const SHARED_MODULES_LAZY_LOCK_KEY: &str = "Plugins::SHARED_MODULES";
static SHARED_MODULES: LazyLock<RwLock<HashMap<String, mlua::Value>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn get(module_name: &str) -> Result<Option<mlua::Value>, Error> {
    if module_name.is_empty() || !module_name.contains(":") {
        return Err(anyhow!("Invalid module name '{}'. Module names must be in the format 'plugin_name:module_name'", module_name));
    }

    let shared_modules = SHARED_MODULES.read().map_err(|_| anyhow!("{} lock poisoned", SHARED_MODULES_LAZY_LOCK_KEY))?;
    return Ok(shared_modules.get(module_name).cloned());
}

pub fn add(module_name: String, module_table: mlua::Value) -> Result<(), Error> {
    if module_name.is_empty() || !module_name.contains(":") {
        return Err(anyhow!("Invalid module name '{}'. Module names must be in the format 'plugin_name:module_name'", module_name));
    }

    let mut shared_modules = SHARED_MODULES.write().map_err(|_| anyhow!("{} lock poisoned", SHARED_MODULES_LAZY_LOCK_KEY))?;
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

    let mut shared_modules = SHARED_MODULES.write().map_err(|_| anyhow!("{} lock poisoned", SHARED_MODULES_LAZY_LOCK_KEY))?;
    if !shared_modules.contains_key(module_name) {
        return Err(anyhow!("Module '{}' is not exposed", module_name));
    }

    shared_modules.remove(module_name);
    return Ok(());
}

pub fn clear() -> Result<(), Error> {
    let mut shared_modules = SHARED_MODULES.write().map_err(|_| anyhow!("{} lock poisoned", SHARED_MODULES_LAZY_LOCK_KEY))?;
    shared_modules.clear();
    return Ok(());
}
