/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
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

use std::sync::OnceLock;

use tokio::sync::broadcast;
use unichat::UniChatEvent;

pub mod unichat;

pub struct EventEmitter {
    tx: broadcast::Sender<UniChatEvent>
}

impl EventEmitter {
    fn new() -> Self {
        let (tx, rx) = broadcast::channel::<UniChatEvent>(1000);
        drop(rx);

        return Self { tx };
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

static INSTANCE: OnceLock<EventEmitter> = OnceLock::new();

pub fn init(_app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    let result = INSTANCE.set(EventEmitter::new());
    if result.is_err() {
        return Err("Failed to initialize event emitter".into());
    }

    return Ok(());
}

pub fn event_emitter() -> &'static EventEmitter {
    return INSTANCE.get().unwrap();
}
