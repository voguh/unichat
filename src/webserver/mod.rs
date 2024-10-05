use std::sync::{Arc, Mutex};

use tokio::task::JoinHandle;

pub mod routes;

#[derive(Default)]
pub struct WebServerState {
    pub handle: Arc<Mutex<Option<JoinHandle<()>>>>
}
