/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;
use serde::de::DeserializeOwned;

use crate::UNICHAT_VERSION;
use crate::utils::ureq;

pub mod release;

/* ========================================================================== */

const UNICHAT_API_URL: &str = "https://unichat.voguh.me/api/v1";

pub fn url(path: &str) -> String {
    return format!("{}{}", UNICHAT_API_URL, path);
}

pub fn get<T: DeserializeOwned>(path: &str) -> Result<T, Error> {
    let full_url = url(path);
    log::info!("Fetching '{}' from UniChat API...", full_url);

    let mut response = ureq::get(&full_url).header("User-Agent", format!("UniChat/{}", UNICHAT_VERSION)).call()?;
    return response.body_mut().read_json().map_err(|e| e.into());
}
