/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use crate::utils::constants::BASE_REST_PORT;

mod routes;

pub struct ActixState {
    handle: tauri::async_runtime::JoinHandle<()>
}

impl ActixState {
    fn new(_app: &tauri::AppHandle<tauri::Wry>) -> Self {
        let handle = tauri::async_runtime::spawn(async move {
            let http_server = actix_web::HttpServer::new(move || {
                return actix_web::App::new().wrap(actix_web::middleware::Logger::default())
                    .service(routes::ws)
                    .service(routes::ytimg)
                    .service(routes::gallery)
                    .service(routes::get_assets)
                    .service(routes::get_widget_assets)
                    .service(routes::get_widget);
            }).bind(("127.0.0.1", BASE_REST_PORT)).expect("Failed to bind actix server to port");

            http_server.run().await.expect("An error occurred on run actix server")
        });

        return Self { handle };
    }

    pub fn stop(&self) {
        self.handle.abort();
    }
}

pub fn new(app: &tauri::App<tauri::Wry>) -> ActixState {
    let app_handle = app.handle();
    return ActixState::new(app_handle);
}
