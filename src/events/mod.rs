use std::sync::{Arc, LazyLock, Mutex};
use std::sync::mpsc::{channel, Receiver, Sender};

pub struct EventEmitter {
    pub tx: Sender<serde_json::Value>,
    pub rx: Arc<Mutex<Receiver<serde_json::Value>>>
}

pub static INSTANCE: LazyLock<Mutex<EventEmitter>> = LazyLock::new(|| {
    let (tx, rx) = channel::<serde_json::Value>();
    Mutex::new(EventEmitter { tx, rx: Arc::new(Mutex::new(rx)) })
});
