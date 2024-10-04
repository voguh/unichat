use std::collections::HashMap;

type Callback = Box<dyn Fn(&str) + Send + 'static>;

pub struct EventEmitter {
    events: HashMap<String, Vec<Callback>>,
}

impl EventEmitter {
    pub fn new() -> Self {
        Self {
            events: HashMap::new(),
        }
    }

    pub fn on<F: Fn(&str) + Send + 'static,>(&mut self, event_name: &str, callback: F) {
        let callbacks = self.events.entry(event_name.to_string()).or_insert(vec![]);
        callbacks.push(Box::new(callback));
    }

    pub fn emit(&self, event_name: &str, data: &str) {
        if let Some(callbacks) = self.events.get(event_name) {
            for callback in callbacks {
                callback(data);
            }
        }
    }
}
