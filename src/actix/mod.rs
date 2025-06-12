mod routes;

pub struct ActixState {
    pub handle: tauri::async_runtime::JoinHandle<()>
}

pub fn new(_app: &tauri::App<tauri::Wry>) -> tauri::async_runtime::JoinHandle<()> {
    let handler = tauri::async_runtime::spawn(async move {
        let http_server = actix_web::HttpServer::new(move || {
            return actix_web::App::new().wrap(actix_web::middleware::Logger::default())
                .service(routes::ws).service(routes::widget);
        }).bind(("127.0.0.1", 9527)).expect("An error occurred on bind address 127.0.0.1:9527");

        http_server.run().await.expect("An error occurred on run actix server")
    });

    return handler;
}
