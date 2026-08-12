/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::path::PathBuf;

use anyhow::Error;

use crate::utils::properties;
use crate::utils::properties::AppPaths;

pub fn cache_path(file: &str) -> Result<PathBuf, Error> {
    let app_cache_dir = properties::get_app_path(AppPaths::AppCache);
    if !app_cache_dir.exists() {
        fs::create_dir_all(&app_cache_dir)?;
    }

    return Ok(app_cache_dir.join(file));
}
