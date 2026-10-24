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
use std::sync::RwLockReadGuard;

use anyhow::Error;
use anyhow::anyhow;
use serde::Deserialize;
use serde::Serialize;

use crate::utils::settings;
use crate::utils::settings::SETTINGS_CURRENCY_TARGET_KEY;

mod currencies;
mod rates;

/* ========================================================================== */

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UniChatCurrency {
    pub code: String,
    pub name: String,
    pub symbol: String
}

static TARGET_CURRENCY: LazyLock<RwLock<Option<UniChatCurrency>>> = LazyLock::new(|| RwLock::new(None));
fn read() -> RwLockReadGuard<'static, Option<UniChatCurrency>> {
    return TARGET_CURRENCY.read().expect("Currency::TARGET_CURRENCY lock poisoned");
}

fn write(new_value: Option<UniChatCurrency>) {
    let mut guard = TARGET_CURRENCY.write().expect("Currency::TARGET_CURRENCY lock poisoned");
    *guard = new_value;
}

/* ========================================================================== */

pub fn currencies() -> Vec<UniChatCurrency> {
    return currencies::get();
}

pub fn target_currency() -> Option<UniChatCurrency> {
    return read().clone();
}

fn refresh_rates(value: serde_json::Value) -> Result<(), Error> {
    let code: String = serde_json::from_value(value)?;
    let code = code.to_ascii_uppercase();
    if code.is_empty() || code.len() != 3 {
        rates::clear_rates();
        write(None);

        return Ok(());
    }

    if Some(code.clone()) == target_currency().map(|c| c.code) {
        return Ok(());
    }

    let currencies_list = currencies::get();
    if currencies_list.is_empty() {
        return Err(anyhow!("Empty currencies list"));
    }

    let target_currency = currencies_list.iter().find(|c| c.code == code).cloned();
    if target_currency.is_none() {
        return Err(anyhow!("Currency '{}' not found", code));
    }

    if let Err(err) = rates::fetch_rates(&code) {
        return Err(anyhow!("Failed to fetch rates for '{}': {:#?}", code, err));
    }

    write(target_currency);

    return Ok(());
}

pub fn init() -> Result<(), Error> {
    settings::add_change_listener(SETTINGS_CURRENCY_TARGET_KEY, |_, value| {
        let move_value = value.clone();
        tauri::async_runtime::spawn_blocking(move || {
            if let Err(err) = refresh_rates(move_value) {
                log::error!("Failed to refresh rates: {:#?}", err);
            }
        });
    });

    currencies::init()?;

    if let Ok(code) = settings::get_item::<serde_json::Value>(SETTINGS_CURRENCY_TARGET_KEY) {
        refresh_rates(code)?;
    }

    return Ok(());
}

/* ========================================================================== */

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
