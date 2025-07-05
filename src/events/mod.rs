/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use std::collections::VecDeque;
use std::sync::LazyLock;
use std::sync::RwLock;

use tokio::sync::broadcast;
use unichat::UniChatEvent;

pub mod unichat;

const MAX_CAPACITY: usize = 50;
static INSTANCE: LazyLock<EventEmitter> = LazyLock::new(|| EventEmitter::new());

pub struct EventEmitter {
    tx: broadcast::Sender<UniChatEvent>,
    latest_events_cache: RwLock<VecDeque<UniChatEvent>>
}

impl EventEmitter {
    fn new() -> Self {
        let (tx, _rx) = broadcast::channel::<UniChatEvent>(1000);
        drop(_rx); // Drop the receiver to avoid holding onto it unnecessarily

        tauri::async_runtime::spawn(async move {
            let event_emitter:&'static EventEmitter = &INSTANCE;
            let mut rx = event_emitter.subscribe();

            loop {
                let received = rx.recv().await;

                match received {
                    Ok(event) => {
                        if let Ok(mut cache) = event_emitter.latest_events_cache.write() {
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

        return Self { tx, latest_events_cache: RwLock::new(VecDeque::with_capacity(MAX_CAPACITY)) };
    }

    pub fn latest_events(&self) -> Vec<UniChatEvent> {
        if let Ok(cache) = self.latest_events_cache.read() {
            return cache.iter().cloned().collect();
        }

        return Vec::new();
    }

    pub fn subscribe(&self) -> broadcast::Receiver<UniChatEvent> {
        return self.tx.subscribe();
    }

    pub fn emit(&self, event: UniChatEvent) -> Result<(), Box<dyn std::error::Error>> {
        if let Err(err) = self.tx.send(event.clone()) {
            return Err(Box::new(err));
        }

        return Ok(());
    }
}

pub fn event_emitter() -> &'static EventEmitter {
    return &INSTANCE;
}
