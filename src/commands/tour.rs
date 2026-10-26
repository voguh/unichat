/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashSet;

use tauri::Runtime;

use crate::settings;

/* ========================================================================== */

#[tauri::command]
pub async fn get_prev_tour_steps<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Vec<String>, String> {
    let prev_tour_steps = settings::get_previous_tour_steps();
    return Ok(prev_tour_steps);
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_tour_steps<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Vec<String>, String> {
    let tour_steps = settings::get_current_tour_steps();
    return Ok(tour_steps);
}

/* ========================================================================== */

#[tauri::command]
pub async fn set_tour_steps<R: Runtime>(_app: tauri::AppHandle<R>, new_steps: Vec<String>) -> Result<(), String> {
    let current_tour_steps = settings::get_current_tour_steps();

    let current_hash_set: HashSet<_> = current_tour_steps.iter().cloned().collect();
    let new_hash_set: HashSet<_> = new_steps.iter().cloned().collect();

    if current_hash_set != new_hash_set {
        let new_prev_tour_steps: Vec<String>;
        if current_tour_steps.is_empty() {
            new_prev_tour_steps = new_steps.clone();
        } else {
            new_prev_tour_steps = current_tour_steps;
        }

        settings::set_previous_tour_steps(&new_prev_tour_steps);
        settings::set_current_tour_steps(&new_steps);
    }

    return Ok(());
}

/* ========================================================================== */

#[tauri::command]
pub async fn tour_steps_has_new<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<bool, String> {
    let prev_tour_steps = settings::get_previous_tour_steps();
    let current_tour_steps = settings::get_current_tour_steps();

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
