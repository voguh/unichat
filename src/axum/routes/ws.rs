/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;

use axum::extract::Query;
use axum::extract::WebSocketUpgrade;
use axum::extract::ws::Message;
use axum::extract::ws::WebSocket;
use axum::response::IntoResponse;
use futures::SinkExt;
use futures::StreamExt;
use futures::stream::SplitSink;
use futures::stream::SplitStream;
use serde::Deserialize;
use serde_json::Value;
use tokio::sync::broadcast::error::RecvError;

use crate::currency;
use crate::events;
use crate::utils::userstore;
use crate::widgets;

/* ========================================================================== */

#[derive(Debug, Deserialize)]
pub struct WSParams {
    widget: Option<String>
}

/* ========================================================================== */

fn resolve_fieldstate(widget: Option<String>) -> HashMap<String, Value> {
    if let Some(rest_path) = widget {
        if let Some(metadata) = widgets::get_widget_from_rest_path(&rest_path) {
            return metadata.fieldstate();
        }
    }

    return HashMap::new();
}

async fn forward_events(sender: &mut SplitSink<WebSocket, Message>) {
    let mut rx = events::subscribe();
    loop {
        let event = rx.recv().await;
        if let Ok(event) = &event {
            let message = serde_json::to_string(event).expect("Failed to serialize UniChatEvent");
            if let Err(err) = sender.send(Message::Text(message.into())).await {
                log::error!("Failed to send message over WebSocket: {:#?}", err);
                return;
            }
        } else if let Err(RecvError::Lagged(skipped)) = &event {
            log::warn!("Events broadcast lagged, skipped {} messages", skipped);
        } else {
            log::info!("Events broadcast channel closed");
            return;
        }
    }
}

async fn wait_disconnect(receiver: &mut SplitStream<WebSocket>) {
    while let Some(message) = receiver.next().await {
        if let Err(err) = &message {
            log::error!("WebSocket receive error: {:#?}", err);
            break;
        } else if let Ok(Message::Close(_)) = message {
            break;
        }
    }

    log::info!("WebSocket client disconnected");
}

async fn handle_socket(socket: WebSocket, widget: Option<String>) {
    let (mut sender, mut receiver) = socket.split();

    /* ====================================================================== */

    let userstore_data = userstore::get_all_items();
    let fieldstate_data = resolve_fieldstate(widget);
    let currency_data = currency::target_currency();
    let connected_event = serde_json::json!({
        "type": "unichat:connected",
        "data": {
            "userstore": userstore_data,
            "fieldstate": fieldstate_data,
            "currency": currency_data
        }
    });

    if let Err(err) = sender.send(Message::Text(connected_event.to_string().into())).await {
        log::error!("Failed to send connected event: {:#?}", err);
    }

    /* ====================================================================== */

    let history_data = events::latest_events();
    let history_event = serde_json::json!({ "type": "unichat:history", "data": history_data });
    if let Err(err) = sender.send(Message::Text(history_event.to_string().into())).await {
        log::error!("Failed to send history event: {:#?}", err);
    }

    /* ====================================================================== */

    tokio::select! {
        _ = forward_events(&mut sender) => {},
        _ = wait_disconnect(&mut receiver) => {}
    }
}

pub async fn ws(ws: WebSocketUpgrade, Query(params): Query<WSParams>) -> impl IntoResponse {
    return ws.on_upgrade(|socket| handle_socket(socket, params.widget));
}
