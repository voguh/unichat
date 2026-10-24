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
use std::sync::OnceLock;
use std::time::Duration;

use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::cache;
use crate::currency::UniChatCurrency;
use crate::utils::ureq;

/* ========================================================================== */

// Currency symbols from CLDR `en-US` for the currencies whose symbol differs from their code.
// Generated from `https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-numbers-full/main/en/currencies.json`
// reading the `symbol` field, never `symbol-alt-narrow`.
static ICU_SYMBOLS: LazyLock<HashMap<&str, &str>> = LazyLock::new(|| {
    return HashMap::from([
        ("AUD", "A$"),
        ("BRL", "R$"),
        ("CAD", "CA$"),
        ("CNY", "CN¥"),
        ("EUR", "€"),
        ("GBP", "£"),
        ("HKD", "HK$"),
        ("ILS", "₪"),
        ("INR", "₹"),
        ("JPY", "¥"),
        ("KRW", "₩"),
        ("MXN", "MX$"),
        ("NZD", "NZ$"),
        ("PHP", "₱"),
        ("TWD", "NT$"),
        ("USD", "$"),
        ("VND", "₫"),
        ("XAF", "FCFA"),
        ("XCD", "EC$"),
        ("XCG", "Cg."),
        ("XOF", "F CFA"),
        ("XPF", "CFPF")
    ]);
});

static ICU_TAKEN: LazyLock<HashMap<&'static str, &'static str>> = LazyLock::new(|| {
    return ICU_SYMBOLS.iter().map(|(code, symbol)| (*symbol, *code)).collect();
});

/* ========================================================================== */

static CURRENCIES: OnceLock<Vec<UniChatCurrency>> = OnceLock::new();
pub fn get() -> Vec<UniChatCurrency> {
    if let Some(currencies) = CURRENCIES.get() {
        return currencies.clone();
    }

    return Vec::new();
}

fn set(currencies: Vec<UniChatCurrency>) {
    CURRENCIES.set(currencies).expect("Currency::CURRENCIES already set");
}

/* ========================================================================== */

const CURRENCIES_URL: &str = "https://api.frankfurter.dev/v2/currencies";
const CURRENCIES_FILE_TTL: Duration = Duration::from_secs(60 * 60 * 24 * 30);

#[rustfmt::skip]
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FrankfurterCurrency {
    pub iso_code: String,
    // pub iso_numeric: String,
    pub name: String,
    pub symbol: String
    // pub start_date: String,
    // pub end_date: String
}

fn fetch_currency_list() -> Result<Vec<UniChatCurrency>, Error> {
    log::info!("Fetching currency list from '{}'...", CURRENCIES_URL);
    let mut response = ureq::get(CURRENCIES_URL).call()?;
    let entries: Vec<serde_json::Value> = response.body_mut().read_json()?;

    let mut parsed: Vec<FrankfurterCurrency> = Vec::new();
    let mut claims: HashMap<String, Vec<String>> = HashMap::new();
    for entry in entries.iter() {
        let iso_code = entry.get("iso_code").and_then(|v| v.as_str()).unwrap_or_default();
        let name = entry.get("name").and_then(|v| v.as_str()).unwrap_or_default();
        if iso_code.is_empty() || name.is_empty() {
            log::warn!("Skipping invalid currency entry: {}", entry);
            continue;
        }

        let mut symbol = entry.get("symbol").and_then(|v| v.as_str()).unwrap_or(iso_code).to_string();

        if let Some(icu_symbol) = ICU_SYMBOLS.get(iso_code) {
            symbol = icu_symbol.to_string();
        } else if let Some(code) = ICU_TAKEN.get(symbol.as_str()) {
            if iso_code != *code {
                symbol = iso_code.to_string();
            }
        }

        if let Some(codes) = claims.get_mut(&symbol) {
            codes.push(iso_code.to_string());
        } else {
            claims.insert(symbol.clone(), vec![iso_code.to_string()]);
        }

        parsed.push(FrankfurterCurrency { iso_code: iso_code.to_string(), name: name.to_string(), symbol });
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

    return Ok(list);
}

pub fn init() -> Result<(), Error> {
    let list: Vec<UniChatCurrency> = cache::get_or_fetch("currency_list", CURRENCIES_FILE_TTL, fetch_currency_list)?;
    set(list);

    return Ok(());
}
