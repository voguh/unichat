use std::sync::{LazyLock, Mutex};

use tokio::sync::broadcast;
use unichat::UniChatEvent;

pub mod unichat;

pub struct EventEmitter {
    pub tx: broadcast::Sender<UniChatEvent>,
}

pub static INSTANCE: LazyLock<Mutex<EventEmitter>> = LazyLock::new(|| {
    let (tx, _rx) = broadcast::channel::<UniChatEvent>(1000);
    Mutex::new(EventEmitter { tx })
});
