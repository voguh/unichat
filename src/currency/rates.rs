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
use std::sync::RwLock;
use std::time::Duration;

use anyhow::anyhow;
use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::currency::UniChatCurrency;
use crate::currency::currencies;
use crate::currency::utils::cache_path;

#[derive(Default)]
struct RatesStore {
    items: Vec<(String, String, f64)>,
    by_code: HashMap<String, usize>,
    by_symbol: HashMap<String, usize>
}

const RATES_LOCK_NAME: &str = "Currency::RATES";
static RATES: LazyLock<RwLock<RatesStore>> = LazyLock::new(|| RwLock::new(RatesStore::default()));

impl RatesStore {
    pub fn add(&mut self, code: String, symbol: String, rate: f64) {
        let index = self.items.len();
        self.by_code.insert(code.clone(), index);
        self.by_symbol.insert(symbol.clone(), index);
        self.items.push((code, symbol, rate));
    }

    pub fn add_all(&mut self, rates: Vec<(String, String, f64)>) {
        for (code, symbol, rate) in rates {
            self.add(code, symbol, rate);
        }
    }

    fn get_by_code(&self, code: &str) -> Option<&(String, String, f64)> {
        return self.by_code.get(code).map(|&index| &self.items[index]);
    }

    fn get_by_symbol(&self, symbol: &str) -> Option<&(String, String, f64)> {
        return self.by_symbol.get(symbol).map(|&index| &self.items[index]);
    }

    fn clear(&mut self) {
        self.items.clear();
        self.by_code.clear();
        self.by_symbol.clear();
    }
}

/* ========================================================================== */

pub fn get_rate_by_code(code: &str) -> Option<f64> {
    if let Ok(lock) = RATES.read() {
        return lock.get_by_code(code).map(|(_, _, rate)| *rate);
    }

    return None;
}

pub fn get_rate_by_symbol(symbol: &str) -> Option<f64> {
    if let Ok(lock) = RATES.read() {
        return lock.get_by_symbol(symbol).map(|(_, _, rate)| *rate);
    }

    return None;
}

pub fn clear_rates() {
    if let Ok(mut lock) = RATES.write() {
        lock.clear();
    } else {
        log::error!("{} is poisoned", RATES_LOCK_NAME);
    }
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

pub fn fetch_rates(target: &str) -> Result<(), Error> {
    let path = cache_path(&format!("currency_rates_{}.json", target))?;
    if let Ok(metadata) = fs::metadata(&path) {
        if metadata.modified()?.elapsed()? < RATES_FILE_TTL {
            let body = fs::read_to_string(&path)?;
            let rates: Vec<(String, String, f64)> = serde_json::from_str(&body)?;

            if let Ok(mut state) = RATES.write() {
                state.clear();
                state.add_all(rates);
                return Ok(());
            }
        }
    }

    let currencies_list: HashMap<String, UniChatCurrency> = currencies::list().iter().map(|c| (c.code.clone(), c.clone())).collect();
    if currencies_list.is_empty() {
        return Err(anyhow!("Currency list is empty. Please update the currency list first."));
    }

    let url = format!("{}?base={}", RATES_URL, target);
    log::info!("Fetching currency rates from '{}'...", url);
    let response = reqwest::blocking::get(url)?;
    let entries: Vec<FrankfurterRate> = response.json()?;

    if let Ok(mut state) = RATES.write() {
        state.clear();

        for entry in entries.iter() {
            if let Some(currency) = currencies_list.get(&entry.quote) {
                state.add(currency.code.clone(), currency.symbol.clone(), entry.rate);
            }
        }

        let raw = serde_json::to_string(&state.items)?;
        fs::write(&path, raw)?;
    }

    return Ok(());
}
