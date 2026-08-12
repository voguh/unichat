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
use std::thread;

use anyhow::Error;

use crate::events::unichat::UniChatEmote;

mod betterttv;
mod frankerfacez;
mod seventv;

pub static EMOTES_HASHSET: LazyLock<RwLock<HashMap<String, UniChatEmote>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

type EmotesResult = Result<HashMap<String, UniChatEmote>, Error>;

fn join_emotes(results: Vec<EmotesResult>, context: &str) {
    let mut emotes: HashMap<String, UniChatEmote> = HashMap::new();
    for result in results.into_iter() {
        match result {
            Err(err) => log::error!("Failed to fetch {} shared emotes: {:#?}", context, err),
            Ok(batch) => {
                emotes.extend(batch);
            }
        }
    }

    if let Ok(mut guard) = EMOTES_HASHSET.write() {
        guard.extend(emotes);
    }
}

pub fn fetch_global_shared_emotes() -> Result<(), Error> {
    tauri::async_runtime::spawn_blocking(|| {
        let results = thread::scope(|scope| {
            let bttv = scope.spawn(betterttv::fetch_global_emotes);
            let ffz = scope.spawn(frankerfacez::fetch_global_emotes);
            let stv = scope.spawn(seventv::fetch_global_emotes);

            return vec![bttv.join(), ffz.join(), stv.join()];
        });

        join_emotes(results.into_iter().flatten().collect(), "global");
    });

    return Ok(());
}

pub fn fetch_shared_emotes(platform: &str, channel_id: &str) -> Result<(), Error> {
    let platform = platform.to_string();
    let channel_id = channel_id.to_string();

    tauri::async_runtime::spawn_blocking(move || {
        log::info!("Fetching channel shared emotes ({}:{})...", platform, channel_id);

        let results = thread::scope(|scope| {
            let bttv = scope.spawn(|| betterttv::fetch_channel_emotes(platform.clone(), channel_id.clone()));
            let ffz = scope.spawn(|| frankerfacez::fetch_channel_emotes(platform.clone(), channel_id.clone()));
            let stv = scope.spawn(|| seventv::fetch_channel_emotes(platform.clone(), channel_id.clone()));

            return vec![bttv.join(), ffz.join(), stv.join()];
        });

        join_emotes(results.into_iter().flatten().collect(), "channel");
    });

    return Ok(());
}
