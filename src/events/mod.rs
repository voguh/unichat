use std::sync::{LazyLock, Mutex};

use tokio::sync::broadcast;

pub struct EventEmitter {
    pub tx: broadcast::Sender<serde_json::Value>,
}

pub static INSTANCE: LazyLock<Mutex<EventEmitter>> = LazyLock::new(|| {
    let (tx, _rx) = broadcast::channel::<serde_json::Value>(1000);
    Mutex::new(EventEmitter { tx })
});
