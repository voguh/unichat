/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::sync::LazyLock;
use std::sync::RwLock;

use anyhow::Error;
use anyhow::anyhow;
use serde::Deserialize;
use serde::Serialize;

use crate::utils::settings;
use crate::utils::settings::SETTINGS_CURRENCY_TARGET_KEY;

mod currencies;
mod rates;
mod utils;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UniChatCurrency {
    pub code: String,
    pub name: String,
    pub symbol: String
}

const TARGET_CURRENCY_LOCK_NAME: &str = "Currency::TARGET_CURRENCY";
static TARGET_CURRENCY: LazyLock<RwLock<Option<UniChatCurrency>>> = LazyLock::new(|| RwLock::new(None));

/* ========================================================================== */

pub fn currencies() -> Vec<UniChatCurrency> {
    return currencies::list();
}

pub fn target_currency() -> Option<UniChatCurrency> {
    if let Ok(state) = TARGET_CURRENCY.read() {
        return state.clone();
    }

    return None;
}

fn refresh_rates(value: serde_json::Value) -> Result<(), Error> {
    let code: String = serde_json::from_value(value)?;
    let code = code.to_ascii_uppercase();
    if code.is_empty() || code.len() != 3 {
        rates::clear_rates();

        if let Ok(mut state) = TARGET_CURRENCY.write() {
            *state = None;
        } else {
            log::error!("{} is poisoned", TARGET_CURRENCY_LOCK_NAME);
        }

        return Ok(());
    }

    if Some(code.clone()) == target_currency().map(|c| c.code) {
        return Ok(());
    }

    let currencies_list = currencies::list();
    if currencies_list.is_empty() {
        return Err(anyhow!("Currencies list is empty, cannot refresh rates"));
    }

    let target_currency = currencies_list.iter().find(|c| c.code == code).cloned();
    if target_currency.is_none() {
        return Err(anyhow!("Currency with code '{}' not found in currencies list", code));
    }

    if let Err(err) = rates::fetch_rates(&code) {
        return Err(anyhow!("Failed to fetch rates for '{}': {}", code, err));
    }

    if let Ok(mut state) = TARGET_CURRENCY.write() {
        *state = target_currency;
    } else {
        log::error!("{} is poisoned", TARGET_CURRENCY_LOCK_NAME);
    }

    return Ok(());
}

pub fn init() -> Result<(), Error> {
    settings::add_change_listener(SETTINGS_CURRENCY_TARGET_KEY, |_, value| {
        let move_value = value.clone();
        tauri::async_runtime::spawn_blocking(move || {
            if let Err(err) = refresh_rates(move_value) {
                log::error!("Failed to refresh rates: {}", err);
            }
        });
    });

    currencies::fetch_currencies()?;

    if let Ok(code) = settings::get_item::<serde_json::Value>(SETTINGS_CURRENCY_TARGET_KEY) {
        refresh_rates(code)?;
    }

    return Ok(());
}

/* ================================================================================================================== */

fn round_cents(value: f64) -> f64 {
    return (value * 100.0).round() / 100.0;
}

pub fn convert(value: f64, token: &str) -> Option<(f64, String)> {
    let code = token.trim().to_ascii_uppercase();
    let symbol = token.trim().to_string();

    match target_currency() {
        None => return None,
        Some(state) => {
            if state.code == code || state.symbol == symbol {
                return None;
            }

            if let Some(rate) = rates::get_rate_by_code(&code) {
                return Some((round_cents(value / rate), state.symbol));
            }

            if let Some(rate) = rates::get_rate_by_symbol(&symbol) {
                return Some((round_cents(value / rate), state.symbol));
            }

            return None;
        }
    };
}

pub fn apply(value: f64, currency: &str) -> (f64, String, Option<f64>, Option<String>) {
    if let Some((converted, target)) = convert(value, currency) {
        return (converted, target, Some(value), Some(currency.to_string()));
    }

    return (value, currency.to_string(), None, None);
}
