/*!******************************************************************************

 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use crate::utils::constants::BASE_REST_PORT;
use crate::utils::settings;
use crate::utils::settings::SETTINGS_OPEN_TO_LAN_KEY;

mod routes;

pub struct ActixState {
    handle: tauri::async_runtime::JoinHandle<()>
}

impl ActixState {
    fn new() -> Self {
        let handle = tauri::async_runtime::spawn(async move {
            let mut host = "127.0.0.1";
            if settings::get_item(SETTINGS_OPEN_TO_LAN_KEY).is_ok_and(|v: bool| v == true) {
                host = "0.0.0.0";
            }

            if host != "127.0.0.1" {
                log::warn!("UniChat is running in 'Open to LAN' mode. Make sure your firewall allows incoming connections on port {}.", BASE_REST_PORT);
            }

            let http_server = actix_web::HttpServer::new(move || {
                return actix_web::App::new().wrap(actix_web::middleware::Logger::default())
                    .service(routes::ws)
                    .service(routes::ytimg)
                    .service(routes::gallery)
                    .service(routes::get_assets)
                    .service(routes::get_widget_assets)
                    .service(routes::get_widget);
            }).bind((host, BASE_REST_PORT)).expect("Failed to bind actix server to port");

            http_server.run().await.expect("An error occurred on run actix server")
        });

        return Self { handle };
    }

    pub fn stop(&self) {
        self.handle.abort();
    }
}

pub fn new() -> ActixState {
    return ActixState::new();
}
