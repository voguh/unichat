/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashSet;

use tauri::Runtime;

use crate::error::Error;
use crate::utils::settings;

#[tauri::command]
pub async fn get_prev_tour_steps<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Vec<String>, Error> {
    let prev_tour_steps = settings::get_item(settings::SETTINGS_TOUR_PREV_STEPS_KEY)?;

    return Ok(prev_tour_steps);
}

#[tauri::command]
pub async fn get_tour_steps<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Vec<String>, Error> {
    let tour_steps = settings::get_item(settings::SETTINGS_TOUR_CURRENT_STEPS_KEY)?;

    return Ok(tour_steps)
}

#[tauri::command]
pub async fn set_tour_steps<R: Runtime>(_app: tauri::AppHandle<R>, new_steps: Vec<String>) -> Result<(), Error> {
    let current_tour_steps: Vec<String> = settings::get_item(settings::SETTINGS_TOUR_CURRENT_STEPS_KEY)?;

    let current_hash_set: HashSet<_> = current_tour_steps.iter().cloned().collect();
    let new_hash_set: HashSet<_> = new_steps.iter().cloned().collect();

    if current_hash_set != new_hash_set {
        let new_prev_tour_steps: Vec<String>;
        if current_tour_steps.is_empty() {
            new_prev_tour_steps = new_steps.clone();
        } else {
            new_prev_tour_steps = current_tour_steps;
        }

        settings::set_item(settings::SETTINGS_TOUR_PREV_STEPS_KEY, &new_prev_tour_steps)?;
        settings::set_item(settings::SETTINGS_TOUR_CURRENT_STEPS_KEY, &new_steps)?;
    }

    return Ok(())
}

#[tauri::command]
pub async fn tour_steps_has_new<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<bool, Error> {
    let prev_tour_steps: Vec<String> = settings::get_item(settings::SETTINGS_TOUR_PREV_STEPS_KEY)?;
    let current_tour_steps: Vec<String> = settings::get_item(settings::SETTINGS_TOUR_CURRENT_STEPS_KEY)?;

    let prev_hash_set: HashSet<_> = prev_tour_steps.iter().cloned().collect();
    let mut new_hash_set: HashSet<_> = current_tour_steps.iter().cloned().collect();

    if prev_hash_set != new_hash_set {
        for step in &prev_hash_set {
            new_hash_set.remove(step);
        }

        return Ok(!new_hash_set.is_empty());
    }

    return Ok(false);
}
