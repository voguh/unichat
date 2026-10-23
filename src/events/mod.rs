/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::VecDeque;
use std::sync::LazyLock;
use std::sync::OnceLock;
use std::sync::RwLock;
use std::sync::RwLockReadGuard;

use anyhow::Error;
use tokio::sync::broadcast;
use unichat::UniChatEvent;

use crate::events::unichat::UNICHAT_FLAG_EMULATOR_GENERATED;

pub mod unichat;

/* ========================================================================== */

static EMITTER: OnceLock<broadcast::Sender<UniChatEvent>> = OnceLock::new();
fn get_emitter() -> &'static broadcast::Sender<UniChatEvent> {
    return EMITTER.get().expect("Events::EMITTER was not initialized");
}

fn set_emitter(sender: broadcast::Sender<UniChatEvent>) {
    EMITTER.set(sender).expect("Events::EMITTER was already initialized");
}

/* ========================================================================== */

const MAX_CAPACITY: usize = 50;
static LATEST_EVENTS_CACHE: LazyLock<RwLock<VecDeque<UniChatEvent>>> = LazyLock::new(|| RwLock::new(VecDeque::with_capacity(MAX_CAPACITY)));
fn read_latest_events_cache() -> RwLockReadGuard<'static, VecDeque<UniChatEvent>> {
    return LATEST_EVENTS_CACHE.read().expect("Events::LATEST_EVENTS_CACHE lock poisoned");
}

fn write_latest_events_cache(event: UniChatEvent) {
    let mut cache = LATEST_EVENTS_CACHE.write().expect("Events::LATEST_EVENTS_CACHE lock poisoned");
    if cache.len() == MAX_CAPACITY {
        cache.pop_front();
    }

    cache.push_back(event);
}

/* ========================================================================== */

fn event_is_emulated(event: &UniChatEvent) -> bool {
    return match event {
        UniChatEvent::RemoveMessage(payload) => payload.flags.contains_key(UNICHAT_FLAG_EMULATOR_GENERATED),
        UniChatEvent::RemoveAuthor(payload) => payload.flags.contains_key(UNICHAT_FLAG_EMULATOR_GENERATED),
        UniChatEvent::Message(payload) => payload.flags.contains_key(UNICHAT_FLAG_EMULATOR_GENERATED),
        UniChatEvent::Donate(payload) => payload.flags.contains_key(UNICHAT_FLAG_EMULATOR_GENERATED),
        UniChatEvent::Sponsor(payload) => payload.flags.contains_key(UNICHAT_FLAG_EMULATOR_GENERATED),
        UniChatEvent::SponsorGift(payload) => payload.flags.contains_key(UNICHAT_FLAG_EMULATOR_GENERATED),
        UniChatEvent::Raid(payload) => payload.flags.contains_key(UNICHAT_FLAG_EMULATOR_GENERATED),
        UniChatEvent::Redemption(payload) => payload.flags.contains_key(UNICHAT_FLAG_EMULATOR_GENERATED),
        UniChatEvent::Cheer(payload) => payload.flags.contains_key(UNICHAT_FLAG_EMULATOR_GENERATED),
        _ => false
    }
}

pub fn init() -> Result<(), Error> {
    let (tx, mut rx) = broadcast::channel(1000);

    tauri::async_runtime::spawn(async move {
        loop {
            let received = rx.recv().await;

            match received {
                Ok(event) => {
                    if event_is_emulated(&event) {
                        continue; // Skip caching emulated events
                    }


                    write_latest_events_cache(event);
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped)) => {
                    log::warn!("EventEmitter lagged, skipped {} events", skipped);
                }
                Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                    log::warn!("EventEmitter channel closed, exiting event loop");
                    break;
                }
            }
        }
    });

    set_emitter(tx);

    return Ok(());
}

pub fn latest_events() -> Vec<UniChatEvent> {
    return read_latest_events_cache().iter().cloned().collect();
}

pub fn subscribe() -> broadcast::Receiver<UniChatEvent> {
    return get_emitter().subscribe();
}

pub fn emit(event: UniChatEvent) -> Result<(), Error> {
    let s = get_emitter().send(event)?;
    log::debug!("Event emitted to {} subscribers", s);

    return Ok(());
}
