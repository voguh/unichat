/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

mod routes;

pub struct ActixState {
    pub handle: tauri::async_runtime::JoinHandle<()>
}

pub fn new(_app: &tauri::App<tauri::Wry>) -> tauri::async_runtime::JoinHandle<()> {
    let handler = tauri::async_runtime::spawn(async move {
        let http_server = actix_web::HttpServer::new(move || {
            return actix_web::App::new().wrap(actix_web::middleware::Logger::default()).service(routes::ws)
                .service(routes::get_widget_assets).service(routes::get_widget);
        }).bind(("127.0.0.1", 9527)).expect("An error occurred on bind address 127.0.0.1:9527");

        http_server.run().await.expect("An error occurred on run actix server")
    });

    return handler;
}
