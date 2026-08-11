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
use std::path::PathBuf;
use std::sync::LazyLock;
use std::sync::Mutex;
use std::sync::RwLock;
use std::time::Duration;
use std::time::Instant;

use anyhow::anyhow;
use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::settings;

const RATES_URL: &str = "https://api.frankfurter.dev/v2/rates";
const CURRENCIES_URL: &str = "https://api.frankfurter.dev/v2/currencies";
const CURRENCIES_CACHE_FILE: &str = "currency_list.json";

const RATES_TTL: Duration = Duration::from_secs(60 * 60 * 24);
const CURRENCIES_TTL: Duration = Duration::from_secs(60 * 60 * 24 * 30);
const REFRESH_COOLDOWN: Duration = Duration::from_secs(60);

// Currency symbols from CLDR `en-US`, the locale the scraper webview is locked to, for the currencies
// whose symbol differs from their code. Generated from `cldr-numbers-full/main/en/currencies.json`
// reading the `symbol` field, never `symbol-alt-narrow`.
static ICU_SYMBOLS: LazyLock<HashMap<&'static str, &'static str>> = LazyLock::new(|| {
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

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FrankfurterCurrency {
    pub iso_code: String,
    pub iso_numeric: String,
    pub name: String,
    pub symbol: String,
    pub start_date: String,
    pub end_date: String
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FrankfurterRate {
    pub date: String,
    pub base: String,
    pub quote: String,
    pub rate: f64
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UniChatCurrency {
    pub code: String,
    pub name: String,
    pub symbol: String
}

struct CurrencyState {
    target: Option<String>,
    rates: HashMap<String, f64>,
    currencies: Vec<UniChatCurrency>
}

const STATE_LOCK_NAME: &str = "Currency::STATE";
static STATE: LazyLock<RwLock<CurrencyState>> = LazyLock::new(|| {
    return RwLock::new(CurrencyState { target: None, rates: HashMap::new(), currencies: Vec::new() });
});

static LAST_REFRESH: LazyLock<Mutex<Option<(String, Instant)>>> = LazyLock::new(|| Mutex::new(None));

/* ================================================================================================================== */

fn cache_path(file: &str) -> Result<PathBuf, Error> {
    let app_cache_dir = properties::get_app_path(AppPaths::AppCache);
    if !app_cache_dir.exists() {
        fs::create_dir_all(&app_cache_dir)?;
    }

    return Ok(app_cache_dir.join(file));
}

fn rates_cache_path(target: &str) -> Result<PathBuf, Error> {
    if target.len() != 3 || !target.chars().all(|c| c.is_ascii_uppercase()) {
        return Err(anyhow!("Invalid target currency code '{}'", target));
    }

    return cache_path(&format!("currency_rates_{}.json", target));
}

async fn fetch_currencies() -> Result<Vec<UniChatCurrency>, Error> {
    let path = cache_path(CURRENCIES_CACHE_FILE)?;
    if let Ok(metadata) = fs::metadata(&path) {
        if metadata.modified()?.elapsed()? < CURRENCIES_TTL {
            let body = fs::read_to_string(&path)?;
            let list: Vec<UniChatCurrency> = serde_json::from_str(&body)?;

            return Ok(list);
        }
    }

    log::info!("Fetching currency list from '{}'...", CURRENCIES_URL);
    let body = reqwest::get(CURRENCIES_URL).await?.text().await?;
    let mut parsed: Vec<FrankfurterCurrency> = serde_json::from_str(&body)?;

    let mut claims: HashMap<String, Vec<String>> = HashMap::new();
    for currency in parsed.iter_mut() {
        if let Some(symbol) = ICU_SYMBOLS.get(currency.iso_code.as_str()) {
            currency.symbol = symbol.to_string();
        }

        if let Some(codes) = claims.get_mut(&currency.symbol) {
            codes.push(currency.iso_code.clone());
        } else {
            claims.insert(currency.symbol.clone(), vec![currency.iso_code.clone()]);
        }
    }

    let mut list: Vec<UniChatCurrency> = Vec::new();
    for mut currency in parsed.into_iter() {
        if let Some(code) = ICU_TAKEN.get(currency.symbol.as_str()) {
            if currency.iso_code != *code {
                currency.symbol = currency.iso_code.clone();
            }
        } else if let Some(codes) = claims.get(&currency.symbol) {
            if codes.len() != 1 {
                currency.symbol = currency.iso_code.clone();
            }
        }

        list.push(UniChatCurrency { code: currency.iso_code, name: currency.name, symbol: currency.symbol });
    }

    list.sort_by(|a, b| a.code.cmp(&b.code));
    fs::write(&path, serde_json::to_string(&list)?)?;

    return Ok(list);
}

async fn fetch_rates(target: &str) -> Result<HashMap<String, f64>, Error> {
    let path = rates_cache_path(target)?;
    if let Ok(metadata) = fs::metadata(&path) {
        if metadata.modified()?.elapsed()? < RATES_TTL {
            let body = fs::read_to_string(&path)?;
            let rates: HashMap<String, f64> = serde_json::from_str(&body)?;

            return Ok(rates);
        }
    }

    let url = format!("{}?base={}", RATES_URL, target);
    log::info!("Fetching currency rates from '{}'...", url);
    let body = reqwest::get(url).await?.text().await?;
    let entries: Vec<FrankfurterRate> = serde_json::from_str(&body)?;

    let first = entries.first().ok_or(anyhow!("Empty currency rates response for '{}'", target))?;
    if !first.base.eq_ignore_ascii_case(target) {
        return Err(anyhow!("Unexpected base '{}' in rates for '{}'", first.base, target));
    }

    let mut rates: HashMap<String, f64> = HashMap::new();
    for entry in entries.iter() {
        rates.insert(entry.quote.to_ascii_uppercase(), entry.rate);
    }

    fs::write(&path, serde_json::to_string(&rates)?)?;

    return Ok(rates);
}

/* ================================================================================================================== */

fn load_currencies() {
    tauri::async_runtime::spawn(async move {
        match fetch_currencies().await {
            Err(err) => log::error!("Failed to fetch currency list: {:#?}", err),
            Ok(list) => {
                if let Ok(mut state) = STATE.write() {
                    state.currencies = list;
                } else {
                    log::error!("{} is poisoned, skipping currency list update", STATE_LOCK_NAME);
                }
            }
        }
    });
}

fn refresh(target: String) {
    if let Ok(mut last) = LAST_REFRESH.lock() {
        if let Some((code, at)) = last.as_ref() {
            if *code == target && at.elapsed() < REFRESH_COOLDOWN {
                log::warn!("Excessive currency refresh calls, ignoring request for '{}'", target);
                return;
            }
        }

        *last = Some((target.clone(), Instant::now()));
    }

    load_currencies();

    tauri::async_runtime::spawn(async move {
        let rates = match fetch_rates(&target).await {
            Ok(rates) => rates,
            Err(err) => {
                log::error!("Failed to fetch currency rates for '{}': {:#?}", target, err);
                return;
            }
        };

        if let Ok(mut state) = STATE.write() {
            if state.target.as_deref() == Some(target.as_str()) {
                state.rates = rates;
                log::info!("Currency rates for '{}' are ready", target);
            }
        } else {
            log::error!("{} is poisoned, skipping rates update", STATE_LOCK_NAME);
        }
    });
}

/* ================================================================================================================== */

fn set_target(code: &str) {
    let code = code.trim().to_ascii_uppercase();

    let mut target: Option<String> = None;
    if code.len() == 3 && code.chars().all(|c| c.is_ascii_uppercase()) {
        target = Some(code);
    }

    let changed = match STATE.write() {
        Ok(mut state) if state.target != target => {
            log::info!("Target currency changed to {:?}", target);
            state.target = target.clone();
            state.rates.clear();

            true
        }
        _ => false
    };

    if !changed {
        return;
    }

    if let Some(target) = target {
        refresh(target);
    }
}

pub fn init() -> Result<(), Error> {
    settings::add_change_listener(settings::SETTINGS_CURRENCY_TARGET_KEY, |_key, value| {
        set_target(value.as_str().unwrap_or_default());
    })?;

    load_currencies();

    let target: String = settings::get_item(settings::SETTINGS_CURRENCY_TARGET_KEY).unwrap_or_default();
    set_target(&target);

    return Ok(());
}

pub fn target() -> Option<String> {
    if let Ok(state) = STATE.read() {
        return state.target.clone();
    }

    return None;
}

/* ================================================================================================================== */

fn round_cents(value: f64) -> f32 {
    return ((value * 100.0).round() / 100.0) as f32;
}

pub fn convert(value: f32, token: &str) -> Option<(f32, String)> {
    if let Ok(state) = STATE.read() {
        if let Some(target) = &state.target {
            let token = token.trim();

            if let Some(rate) = state.rates.get(&token.to_ascii_uppercase()) {
                return Some((round_cents(value as f64 / rate), target.clone()));
            }

            for currency in state.currencies.iter() {
                if currency.symbol == token {
                    if let Some(rate) = state.rates.get(&currency.code) {
                        return Some((round_cents(value as f64 / rate), target.clone()));
                    }

                    break;
                }
            }
        }
    }

    return None;
}

pub fn apply(value: f32, currency: &str) -> (f32, String, Option<f32>, Option<String>) {
    if let Some((converted, target)) = convert(value, currency) {
        return (converted, target, Some(value), Some(currency.to_string()));
    }

    return (value, currency.to_string(), None, None);
}

pub fn currencies() -> Vec<UniChatCurrency> {
    if let Ok(state) = STATE.read() {
        return state.currencies.clone();
    }

    return Vec::new();
}
