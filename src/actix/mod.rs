use std::path::PathBuf;

pub mod routes;

pub struct ActixState {
    pub handle: tauri::async_runtime::JoinHandle<()>
}

pub fn new<R: tauri::Runtime>(_app: &tauri::App<R>, overlays_dir: PathBuf) -> tauri::async_runtime::JoinHandle<()> {
    let handler = tauri::async_runtime::spawn(async move {
        actix_web::HttpServer::new(move || {
            actix_web::App::new().wrap(actix_web::middleware::Logger::default())
                .service(routes::ws)
                .service(actix_files::Files::new("/overlays", &overlays_dir).prefer_utf8(true).index_file("index.html"))
        })
        .bind(("0.0.0.0", 9527)).expect("An error occurred on bind address 0.0.0.0:9527")
        .run().await.expect("An error occurred on run actix server")
    });

    return handler;
}
