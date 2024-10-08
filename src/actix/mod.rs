use std::{path::PathBuf, sync::{Arc, Mutex}};

use tauri::Manager;

pub mod routes;

#[derive(Default)]
pub struct ActixState {
    pub handle: Arc<Mutex<Option<tauri::async_runtime::JoinHandle<()>>>>
}

pub fn register_actix<R: tauri::Runtime>(app: &tauri::App<R>, overlays_dir: PathBuf) {
    let handler = tauri::async_runtime::spawn(async move {
        actix_web::HttpServer::new(move || {
            actix_web::App::new().wrap(actix_web::middleware::Logger::default())
                .service(routes::ws)
                .service(actix_files::Files::new("/overlays", &overlays_dir).prefer_utf8(true).index_file("index.html"))
        })
        .bind(("0.0.0.0", 9527)).expect("An error occurred on bind address 0.0.0.0:9527")
        .run().await.expect("An error occurred on run actix server")
    });

    let state = app.state::<ActixState>();
    *state.handle.lock().unwrap() = Some(handler);
}
