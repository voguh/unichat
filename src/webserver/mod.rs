use std::sync::{Arc, Mutex};

use actix_files::Files;
use actix_web::{middleware::Logger, App, HttpServer};
use routes::events_stream;
use tauri::{Manager, Runtime};
use tokio::task::JoinHandle;

mod routes;

#[derive(Default)]
pub struct ServerState {
    pub handle: Arc<Mutex<Option<JoinHandle<()>>>>,
}

#[tauri::command]
pub async fn start_overlay_server<R: Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    let widgets_dir = app.path().app_data_dir().unwrap().join("widgets");

    let handle = tokio::spawn(async move {
        HttpServer::new(move || {
            App::new()
                .wrap(Logger::default())
                .service(events_stream)
                .service(Files::new("/widgets", &widgets_dir).prefer_utf8(true).index_file("index.html"))
        }).bind(("127.0.0.1", 9527)).unwrap().run().await.unwrap()
    });

    let state = app.state::<ServerState>();
    *state.handle.lock().unwrap() = Some(handle);

    Ok(())
}

#[tauri::command]
pub async fn stop_overlay_server<R: Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    let state = app.state::<ServerState>();
    let mut handle = state.handle.lock().unwrap();

    if let Some(h) = handle.take() {
        h.abort();
        Ok(())
    } else {
        Err("Server is not running".into())
    }
}

#[tauri::command]
pub async fn overlay_server_status<R: Runtime>(app: tauri::AppHandle<R>) -> Result<bool, String> {
    let state = app.state::<ServerState>();
    let handle = state.handle.lock().unwrap();

    Ok(handle.is_some())
}
