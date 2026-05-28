/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;
use axum::Router;
use axum::routing::get;
use axum::routing::post;
use tokio::net::TcpListener;

use crate::utils::constants::BASE_REST_PORT;
use crate::utils::settings;
use crate::utils::settings::SETTINGS_OPEN_TO_LAN_KEY;

mod routes;
mod utils;

pub async fn start() -> Result<(), Error> {
    let mut host = format!("127.0.0.1:{}", BASE_REST_PORT);
    if settings::get_item(SETTINGS_OPEN_TO_LAN_KEY).is_ok_and(|v: bool| v == true) {
        host = format!("0.0.0.0:{}", BASE_REST_PORT);
    }

    if host != format!("127.0.0.1:{}", BASE_REST_PORT) {
        log::warn!("UniChat is running in 'Open to LAN' mode. Make sure your firewall allows incoming connections on port {}.", BASE_REST_PORT);
    }

    let app = Router::new()
        .route("/assets/{*path}", get(routes::assets))
        .route("/gallery/{path}", get(routes::gallery))
        .route("/proxy/{*path}", get(routes::proxy))
        .route("/rpc", post(routes::rpc))
        .route("/widget/{name}", get(routes::get_widget))
        .route("/widget/{name}/assets/{*path}", get(routes::get_widget_assets))
        .route("/ws", get(routes::ws));

    let listener = TcpListener::bind(host).await?;
    axum::serve(listener, app).await?;

    return Ok(());
}
