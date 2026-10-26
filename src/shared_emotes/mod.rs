/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
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
use std::thread;

use anyhow::Error;

use crate::events::UniChatEmote;

mod betterttv;
mod frankerfacez;
mod seventv;

/* ========================================================================== */

static EMOTES: LazyLock<RwLock<HashMap<String, UniChatEmote>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
pub fn read() -> RwLockReadGuard<'static, HashMap<String, UniChatEmote>> {
    return EMOTES.read().expect("SharedEmotes::EMOTES lock poisoned");
}

fn write(emotes: HashMap<String, UniChatEmote>) {
    let mut guard = EMOTES.write().expect("SharedEmotes::EMOTES lock poisoned");
    guard.extend(emotes);
}

/* ========================================================================== */

type EmotesResult = Result<HashMap<String, UniChatEmote>, Error>;

fn join_emotes(results: Vec<EmotesResult>, context: &str) {
    let mut emotes: HashMap<String, UniChatEmote> = HashMap::new();
    for result in results.into_iter() {
        match result {
            Err(err) => log::error!("Failed to fetch {} shared emotes: {:#?}", context, err),
            Ok(batch) => emotes.extend(batch)
        }
    }

    write(emotes);
}

pub fn fetch_global_shared_emotes() {
    tauri::async_runtime::spawn_blocking(|| {
        let results = thread::scope(|scope| {
            let bttv = scope.spawn(betterttv::fetch_global_emotes);
            let ffz = scope.spawn(frankerfacez::fetch_global_emotes);
            let stv = scope.spawn(seventv::fetch_global_emotes);

            return vec![bttv.join(), ffz.join(), stv.join()];
        });

        join_emotes(results.into_iter().flatten().collect(), "global");
    });
}

pub fn fetch_shared_emotes(platform: &str, channel_id: &str) {
    let platform = platform.to_string();
    let channel_id = channel_id.to_string();

    tauri::async_runtime::spawn_blocking(move || {
        log::info!("Fetching channel shared emotes ({}:{})...", platform, channel_id);

        let results = thread::scope(|scope| {
            let bttv = scope.spawn(|| betterttv::fetch_channel_emotes(&platform, &channel_id));
            let ffz = scope.spawn(|| frankerfacez::fetch_channel_emotes(&platform, &channel_id));
            let stv = scope.spawn(|| seventv::fetch_channel_emotes(&platform, &channel_id));

            return vec![bttv.join(), ffz.join(), stv.join()];
        });

        join_emotes(results.into_iter().flatten().collect(), "channel");
    });
}
