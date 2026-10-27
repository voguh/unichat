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
use std::time::Duration;

use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::cache;
use crate::currency::UniChatCurrency;
use crate::currency::currencies;
use crate::utils::ureq;

/* ========================================================================== */

#[derive(Default)]
struct RatesStore {
    by_code: HashMap<String, f64>,
    by_symbol: HashMap<String, f64>
}

static RATES: LazyLock<RwLock<RatesStore>> = LazyLock::new(|| RwLock::new(RatesStore::default()));
fn read() -> RwLockReadGuard<'static, RatesStore> {
    return RATES.read().expect("Currency::RATES lock poisoned");
}

fn write(new_value: RatesStore) {
    let mut guard = RATES.write().expect("Currency::RATES lock poisoned");
    *guard = new_value;
}

/* ========================================================================== */

pub fn get_rate_by_code(code: &str) -> Option<f64> {
    let guard = read();
    return guard.by_code.get(code).copied();
}

pub fn get_rate_by_symbol(symbol: &str) -> Option<f64> {
    let guard = read();
    return guard.by_symbol.get(symbol).copied();
}

pub fn clear_rates() {
    write(RatesStore::default());
}

/* ========================================================================== */

const RATES_URL: &str = "https://api.frankfurter.dev/v2/rates";
const RATES_FILE_TTL: Duration = Duration::from_secs(60 * 60 * 24);

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FrankfurterRate {
    pub date: String,
    pub base: String,
    pub quote: String,
    pub rate: f64
}

fn fetch_rate_list(target: &str) -> Result<Vec<(String, String, f64)>, Error> {
    let mut currencies_list: HashMap<String, UniChatCurrency> = HashMap::new();
    for currency in currencies::get() {
        currencies_list.insert(currency.code.clone(), currency);
    }

    let url = format!("{}?base={}", RATES_URL, target);
    log::info!("Fetching currency rates from '{}'...", url);
    let mut response = ureq::get(url).call()?;
    let entries: Vec<FrankfurterRate> = response.body_mut().read_json()?;

    let mut rates: Vec<(String, String, f64)> = Vec::new();
    for entry in entries.iter() {
        if let Some(currency) = currencies_list.get(&entry.quote) {
            rates.push((currency.code.clone(), currency.symbol.clone(), entry.rate));
        }
    }

    return Ok(rates);
}

pub fn fetch_rates(target: &str) -> Result<(), Error> {
    let key = format!("currency_rates_{}", target);
    let rates: Vec<(String, String, f64)> = cache::get_or_fetch(&key, RATES_FILE_TTL, || fetch_rate_list(target))?;

    let mut new_state = RatesStore::default();
    for (code, symbol, rate) in rates {
        new_state.by_code.insert(code, rate);
        new_state.by_symbol.insert(symbol, rate);
    }

    write(new_state);

    return Ok(());
}
