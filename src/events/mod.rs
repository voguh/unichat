use std::io::Error;
use std::io::ErrorKind;
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

    pub fn emit(&self, event: UniChatEvent) -> Result<(), Error> {
        if let Err(err) = self.tx.send(event.clone()) {
            return Err(Error::new(ErrorKind::Other, format!("Failed to send event: {}", err)));
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
