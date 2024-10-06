use std::{collections::HashMap, sync::atomic::{AtomicUsize, Ordering}};

type Callback = Box<dyn Fn(&str) + Send + 'static>;

pub struct EventEmitter {
    events: HashMap<String, Vec<(usize, Callback)>>,
    next_uid: AtomicUsize
}

impl EventEmitter {
    pub fn new() -> Self {
        Self {
            events: HashMap::new(),
            next_uid: AtomicUsize::new(0)
        }
    }

    pub fn on<F: Fn(&str) + Send + 'static>(&mut self, event_name: &str, callback: F) -> usize {
        let uid = self.next_uid.fetch_add(1, Ordering::SeqCst);
        let callbacks = self.events.entry(event_name.to_string()).or_insert(vec![]);
        callbacks.push((uid, Box::new(callback)));

        uid
    }

    pub fn off(&mut self, event_name: &str, uid: usize) {
        if let Some(callbacks) = self.events.get_mut(event_name) {
            callbacks.retain(|(callback_uid, _)| *callback_uid != uid);
        }
    }

    pub fn emit(&self, event_name: &str, data: &str) {
        if let Some(callbacks) = self.events.get(event_name) {
            for (_, callback) in callbacks {
                callback(data);
            }
        }
    }
}
