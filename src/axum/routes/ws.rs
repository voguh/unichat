/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use axum::extract::WebSocketUpgrade;
use axum::extract::ws::Message;
use axum::extract::ws::WebSocket;
use axum::response::IntoResponse;
use futures::SinkExt as _;
use futures::StreamExt as _;
use tokio::sync::broadcast::error::RecvError;

use crate::events;
use crate::utils::userstore;

async fn handle_socket(socket: WebSocket) {
    let (mut sender, _) = socket.split();

    /* ====================================================================== */

    let userstore_data = userstore::get_all_items().unwrap_or_default();
    let userstore_event = serde_json::json!({ "type": "unichat:connected", "data": { "userstore": userstore_data } });
    if let Ok(parsed) = serde_json::to_string(&userstore_event) {
        if let Err(err) = sender.send(Message::Text(parsed.into())).await {
            log::error!("Failed to send UserStore event: {:#?}", err);
        }
    } else {
        log::error!("Failed to serialize UserStore event");
    }

    /* ====================================================================== */

    let history_data = events::latest_events();
    let history_event = serde_json::json!({ "type": "unichat:history", "data": history_data });
    if let Ok(parsed) = serde_json::to_string(&history_event) {
        if let Err(err) = sender.send(Message::Text(parsed.into())).await {
            log::error!("Failed to send history event: {:#?}", err);
        }
    } else {
        log::error!("Failed to serialize history event");
    }

    /* ====================================================================== */

    let mut rx = events::subscribe().unwrap();
    loop {
        match rx.recv().await {
            Ok(event) => {
                let msg = serde_json::to_string(&event).unwrap();
                if let Err(e) = sender.send(Message::Text(msg.into())).await {
                    log::error!("Failed to send message over WebSocket: {:#?}", e);
                    break;
                }
            },
            Err(RecvError::Lagged(skipped)) => {
                log::warn!("WebSocket receiver lagged, skipped {} messages", skipped);
            },
            Err(RecvError::Closed) => {
                log::info!("WebSocket receiver closed");
                break;
            }
        }
    }
}

pub async fn ws(ws: WebSocketUpgrade) -> impl IntoResponse {
    return ws.on_upgrade(handle_socket);
}
