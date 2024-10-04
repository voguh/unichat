use std::sync::{LazyLock, Mutex};

use event_emitter::EventEmitter;

pub mod event_emitter;

pub static INSTANCE: LazyLock<Mutex<EventEmitter>> = LazyLock::new(|| Mutex::new(EventEmitter::new()));
