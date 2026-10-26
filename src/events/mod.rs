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

use crate::events::unichat::FLAG_EMULATOR_GENERATED;

mod unichat;

/* ========================================================================== */

pub use unichat::FLAG_TWITCH_GIF;
pub use unichat::FLAG_TWITCH_STREAK_DAYS;
pub use unichat::FLAG_YOUTUBE_SUPER_STICKER;
pub use unichat::FLAG_YOUTUBE_SUPERCHAT_PRIMARY_BG_COLOR;
pub use unichat::FLAG_YOUTUBE_SUPERCHAT_PRIMARY_TEXT_COLOR;
pub use unichat::FLAG_YOUTUBE_SUPERCHAT_SECONDARY_BG_COLOR;
pub use unichat::FLAG_YOUTUBE_SUPERCHAT_SECONDARY_TEXT_COLOR;
pub use unichat::FLAG_YOUTUBE_SUPERCHAT_TIER;
pub use unichat::UniChatAuthorType;
pub use unichat::UniChatBadge;
pub use unichat::UniChatCheerEventPayload;
pub use unichat::UniChatClearEventPayload;
pub use unichat::UniChatDonateEventPayload;
pub use unichat::UniChatEmote;
pub use unichat::UniChatEvent;
pub use unichat::UniChatMessageEventPayload;
pub use unichat::UniChatPlatform;
pub use unichat::UniChatRaidEventPayload;
pub use unichat::UniChatRedemptionEventPayload;
pub use unichat::UniChatRemoveAuthorEventPayload;
pub use unichat::UniChatRemoveMessageEventPayload;
pub use unichat::UniChatSponsorEventPayload;
pub use unichat::UniChatSponsorGiftEventPayload;
pub use unichat::UniChatUserstoreUpdateEventPayload;

/* ========================================================================== */

static EMITTER: OnceLock<broadcast::Sender<UniChatEvent>> = OnceLock::new();
fn get_emitter() -> &'static broadcast::Sender<UniChatEvent> {
    return EMITTER.get().expect("Events::EMITTER was not initialized");
}

fn set_emitter(sender: broadcast::Sender<UniChatEvent>) {
    EMITTER.set(sender).expect("Events::EMITTER was already initialized");
}

/* ========================================================================== */

struct Queue<T> {
    items: VecDeque<T>,
    capacity: usize
}

impl<T> Queue<T> {
    fn new(capacity: usize) -> Self {
        return Self { items: VecDeque::with_capacity(capacity), capacity };
    }

    /* ====================================================================== */

    fn iter(&self) -> impl Iterator<Item = &T> {
        return self.items.iter();
    }

    fn push(&mut self, item: T) {
        if self.items.len() == self.capacity {
            self.items.pop_front();
        }

        if self.capacity > 0 {
            self.items.push_back(item);
        }
    }
}

static LATEST_EVENTS: LazyLock<RwLock<Queue<UniChatEvent>>> = LazyLock::new(|| RwLock::new(Queue::new(50)));
fn read_latest_events() -> RwLockReadGuard<'static, Queue<UniChatEvent>> {
    return LATEST_EVENTS.read().expect("Events::LATEST_EVENTS lock poisoned");
}

fn write_latest_events(event: UniChatEvent) {
    let mut cache = LATEST_EVENTS.write().expect("Events::LATEST_EVENTS lock poisoned");
    cache.push(event);
}

/* ========================================================================== */

fn event_is_emulated(event: &UniChatEvent) -> bool {
    return match event {
        UniChatEvent::RemoveMessage(payload) => payload.flags.contains_key(FLAG_EMULATOR_GENERATED),
        UniChatEvent::RemoveAuthor(payload) => payload.flags.contains_key(FLAG_EMULATOR_GENERATED),
        UniChatEvent::Message(payload) => payload.flags.contains_key(FLAG_EMULATOR_GENERATED),
        UniChatEvent::Donate(payload) => payload.flags.contains_key(FLAG_EMULATOR_GENERATED),
        UniChatEvent::Sponsor(payload) => payload.flags.contains_key(FLAG_EMULATOR_GENERATED),
        UniChatEvent::SponsorGift(payload) => payload.flags.contains_key(FLAG_EMULATOR_GENERATED),
        UniChatEvent::Raid(payload) => payload.flags.contains_key(FLAG_EMULATOR_GENERATED),
        UniChatEvent::Redemption(payload) => payload.flags.contains_key(FLAG_EMULATOR_GENERATED),
        UniChatEvent::Cheer(payload) => payload.flags.contains_key(FLAG_EMULATOR_GENERATED),
        _ => false
    };
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

                    write_latest_events(event);
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
    return read_latest_events().iter().cloned().collect();
}

pub fn subscribe() -> broadcast::Receiver<UniChatEvent> {
    return get_emitter().subscribe();
}

pub fn emit(event: UniChatEvent) -> Result<(), Error> {
    let s = get_emitter().send(event)?;
    log::debug!("Event emitted to {} subscribers", s);

    return Ok(());
}
