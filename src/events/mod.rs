/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::VecDeque;
use std::sync::LazyLock;
use std::sync::OnceLock;
use std::sync::RwLock;

use tokio::sync::broadcast;
use unichat::UniChatEvent;

use crate::error::Error;

pub mod unichat;

const ONCE_LOCK_NAME: &str = "Events::INSTANCE";
static INSTANCE: OnceLock<broadcast::Sender<UniChatEvent>> = OnceLock::new();

const MAX_CAPACITY: usize = 50;
static LATEST_EVENTS_CACHE: LazyLock<RwLock<VecDeque<UniChatEvent>>> = LazyLock::new(|| RwLock::new(VecDeque::with_capacity(MAX_CAPACITY)));

pub fn init(_app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    let (tx, mut rx) = broadcast::channel(1000);

    tauri::async_runtime::spawn(async move {
        loop {
            let received = rx.recv().await;

            match received {
                Ok(event) => {
                    if let Ok(mut cache) = LATEST_EVENTS_CACHE.write() {
                        if cache.len() == MAX_CAPACITY {
                            cache.pop_front();
                        }

                        cache.push_back(event);
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped)) => {
                    log::warn!("EventEmitter lagged, skipped {} events", skipped);
                }
                Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                    log::warn!("EventEmitter channel closed, exiting event loop");
                    break; // Exit the loop if the channel is closed
                }
            }
        }
    });

    INSTANCE.set(tx).map_err(|_| Error::OnceLockAlreadyInitialized(ONCE_LOCK_NAME))?;
    return Ok(());
}

pub fn latest_events() -> Vec<UniChatEvent> {
    if let Ok(cache) = LATEST_EVENTS_CACHE.read() {
        return cache.iter().cloned().collect();
    }

    return Vec::new();
}

pub fn subscribe() -> Result<broadcast::Receiver<UniChatEvent>, Error> {
    let instance = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;
    return Ok(instance.subscribe());
}

pub fn emit(event: UniChatEvent) -> Result<(), Error> {
    let instance = INSTANCE.get().ok_or(Error::OnceLockNotInitialized(ONCE_LOCK_NAME))?;

    let s = instance.send(event).map_err(|e| Error::TokioSendError { source: Box::from(e) })?;
    log::debug!("Event emitted to {} subscribers", s);

    return Ok(());
}
