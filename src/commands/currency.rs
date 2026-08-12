/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use tauri::AppHandle;
use tauri::Runtime;

use crate::currency;
use crate::currency::UniChatCurrency;

#[tauri::command]
pub async fn get_currencies<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<UniChatCurrency>, String> {
    return Ok(currency::currencies());
}
