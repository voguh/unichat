/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::anyhow;
use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::utils::base64;
use crate::utils::normalize_value;

pub mod author;
pub mod message;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailsWrapper {
    pub thumbnails: Vec<Thumbnail>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Thumbnail {
    pub url: String
}

pub fn proxy_youtube_url(url: &str) -> String {
    return format!("/proxy/{}?referer=https://www.youtube.com/", base64::url_safe_encode(url));
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PurchaseAmountText {
    pub simple_text: String
}

pub fn parse_purchase_amount(purchase_amount_text: &PurchaseAmountText) -> Result<(String, f64), Error> {
    let raw_text = purchase_amount_text.simple_text.trim();

    let first_digit = raw_text.find(|c: char| c.is_ascii_digit());
    let last_digit = raw_text.rfind(|c: char| c.is_ascii_digit());

    if let (Some(first_digit), Some(last_digit)) = (first_digit, last_digit) {
        let value_raw: String = raw_text[first_digit..=last_digit].chars().filter(|c| !c.is_whitespace()).collect();

        let prefix = raw_text[..first_digit].trim();
        let suffix = raw_text[last_digit + 1..].trim();
        let currency = if !prefix.is_empty() { prefix } else { suffix };

        let value = normalize_value(&value_raw)?;

        return Ok((currency.to_string(), value));
    }

    return Err(anyhow!("Invalid purchase amount text format: '{}'", raw_text));
}
