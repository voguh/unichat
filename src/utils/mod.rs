/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::path::Component;
use std::path::Path;
use std::path::PathBuf;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use anyhow::Error;
use anyhow::anyhow;

pub mod base64;
pub mod constants;
pub mod jsonrpc;
pub mod paths;
pub mod properties;
pub mod semver;
pub mod ureq;
pub mod userstore;

/* ========================================================================== */

pub fn is_dev() -> bool {
    return cfg!(debug_assertions) || tauri::is_dev();
}

/* ========================================================================== */

pub fn get_current_timestamp() -> i64 {
    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).expect("System clock is before UNIX epoch");
    return timestamp.as_millis() as i64;
}

/* ========================================================================== */

pub fn normalize_value(value_raw: &str) -> Result<f64, Error> {
    let last_dot = value_raw.rfind('.');
    let last_comma = value_raw.rfind(',');
    let normalized: String;
    match (last_dot, last_comma) {
        (Some(dot_index), Some(comma_index)) => {
            if dot_index > comma_index {
                normalized = value_raw.replace(",", "");
            } else {
                normalized = value_raw.replace(".", "").replace(",", ".");
            }
        }
        (Some(dot_index), None) => {
            let digits_after_dot = value_raw.len() - dot_index - 1;
            if value_raw.matches(".").count() == 1 && digits_after_dot <= 2 {
                normalized = value_raw.to_string();
            } else {
                normalized = value_raw.replace(".", "");
            }
        }
        (None, Some(comma_index)) => {
            let digits_after_comma = value_raw.len() - comma_index - 1;
            if value_raw.matches(",").count() == 1 && digits_after_comma <= 2 {
                normalized = value_raw.replace(",", ".");
            } else {
                normalized = value_raw.replace(",", "");
            }
        }
        (None, None) => {
            normalized = value_raw.to_string();
        }
    }

    let value: f64 = normalized.parse()?;

    return Ok(value);
}

/* ========================================================================== */

pub fn random_color_by_seed(seed: &str) -> String {
    let mut hash: u32 = 2166136261;
    for byte in seed.as_bytes() {
        hash ^= *byte as u32;
        hash = hash.wrapping_mul(16777619);
    }

    let r = ((hash >> 16) & 0xFF) as u8;
    let g = ((hash >> 8) & 0xFF) as u8;
    let b = (hash & 0xFF) as u8;

    return format!("#{:02X}{:02X}{:02X}", r, g, b);
}

/* ========================================================================== */

pub fn safe_guard_path(base_path: &Path, concat_str: &str) -> Result<PathBuf, Error> {
    let concat_path = Path::new(concat_str);
    for component in concat_path.components() {
        if !matches!(component, Component::Normal(_) | Component::CurDir) {
            return Err(anyhow!("Access to path '{:?}' is not allowed", concat_path));
        }
    }

    return Ok(base_path.join(concat_path));
}
