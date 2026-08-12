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
use std::fs;
use std::sync::LazyLock;
use std::sync::OnceLock;
use std::time::Duration;

use anyhow::anyhow;
use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::currency::UniChatCurrency;
use crate::currency::utils::cache_path;

// Currency symbols from CLDR `en-US` for the currencies whose symbol differs from their code.
// Generated from `https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-numbers-full/main/en/currencies.json`
// reading the `symbol` field, never `symbol-alt-narrow`.
static ICU_SYMBOLS: LazyLock<HashMap<&str, &str>> = LazyLock::new(|| {
    return HashMap::from([
        ("AUD", "A$"), ("BRL", "R$"), ("CAD", "CA$"), ("CNY", "CN¥"), ("EUR", "€"), ("GBP", "£"),
        ("HKD", "HK$"), ("ILS", "₪"), ("INR", "₹"), ("JPY", "¥"), ("KRW", "₩"), ("MXN", "MX$"),
        ("NZD", "NZ$"), ("PHP", "₱"), ("TWD", "NT$"), ("USD", "$"), ("VND", "₫"), ("XAF", "FCFA"),
        ("XCD", "EC$"), ("XCG", "Cg."), ("XOF", "F CFA"), ("XPF", "CFPF")
    ]);
});

static ICU_TAKEN: LazyLock<HashMap<&'static str, &'static str>> = LazyLock::new(|| {
    return ICU_SYMBOLS.iter().map(|(code, symbol)| (*symbol, *code)).collect();
});

// const CURRENCIES_LOCK_NAME: &str = "Currency::CURRENCIES";
pub static CURRENCIES: OnceLock<Vec<UniChatCurrency>> = OnceLock::new();

pub fn list() -> Vec<UniChatCurrency> {
    if let Some(currencies) = CURRENCIES.get() {
        return currencies.clone();
    }

    return Vec::new();
}

/* ========================================================================== */

const CURRENCIES_URL: &str = "https://api.frankfurter.dev/v2/currencies";
const CURRENCIES_FILE_TTL: Duration = Duration::from_secs(60 * 60 * 24 * 30);

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FrankfurterCurrency {
    pub iso_code: String,
    pub iso_numeric: String,
    pub name: String,
    pub symbol: String,
    pub start_date: String,
    pub end_date: String
}

pub fn fetch_currencies() -> Result<(), Error> {
    let path = cache_path("currency_list.json")?;
    if let Ok(metadata) = fs::metadata(&path) {
        if metadata.modified()?.elapsed()? < CURRENCIES_FILE_TTL {
            let body = fs::read_to_string(&path)?;
            let result: Vec<UniChatCurrency> = serde_json::from_str(&body)?;
            return CURRENCIES.set(result).map_err(|_| anyhow!("Failed to set currencies list from cached data"));
        }
    }

    log::info!("Fetching currency list from '{}'...", CURRENCIES_URL);
    let response = reqwest::blocking::get(CURRENCIES_URL)?;
    let mut parsed: Vec<FrankfurterCurrency> = response.json()?;

    let mut claims: HashMap<String, Vec<String>> = HashMap::new();
    for currency in parsed.iter_mut() {
        if let Some(symbol) = ICU_SYMBOLS.get(currency.iso_code.as_str()) {
            currency.symbol = symbol.to_string();
        } else if let Some(code) = ICU_TAKEN.get(currency.symbol.as_str()) {
            if currency.iso_code != *code {
                currency.symbol = currency.iso_code.clone();
            }
        }

        if let Some(codes) = claims.get_mut(&currency.symbol) {
            codes.push(currency.iso_code.clone());
        } else {
            claims.insert(currency.symbol.clone(), vec![currency.iso_code.clone()]);
        }
    }

    let mut list: Vec<UniChatCurrency> = Vec::new();
    for mut currency in parsed.into_iter() {
        if let Some(codes) = claims.get(&currency.symbol) {
            if codes.len() != 1 {
                currency.symbol = currency.iso_code.clone();
            }
        }

        list.push(UniChatCurrency { code: currency.iso_code, name: currency.name, symbol: currency.symbol });
    }

    let raw = serde_json::to_string(&list)?;
    fs::write(&path, raw)?;

    return CURRENCIES.set(list).map_err(|_| anyhow!("Failed to set currencies list from fetched data"));
}
