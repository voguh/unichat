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
use futures::SinkExt as _;
use futures::StreamExt as _;
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
    if let Some(widget_name) = widget {
        if let Ok(metadata) = widgets::get_widget_from_name(&widget_name) {
            return metadata.fieldstate();
        }
    }

    return HashMap::new();
}

async fn handle_socket(socket: WebSocket, widget: Option<String>) {
    let (mut sender, mut receiver) = socket.split();

    /* ====================================================================== */

    let userstore_data = userstore::get_all_items();
    let fieldstate_data = resolve_fieldstate(widget);
    let currency_data = currency::target_currency();
    let userstore_event = serde_json::json!({
        "type": "unichat:connected", "data": {
            "userstore": userstore_data,
            "fieldstate": fieldstate_data,
            "currency": currency_data
        }
    });

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

    let mut rx = events::subscribe();
    loop {
        tokio::select! {
            event = rx.recv() => {
                match event {
                    Ok(event) => {
                        match serde_json::to_string(&event) {
                            Ok(msg) => {
                                if let Err(e) = sender.send(Message::Text(msg.into())).await {
                                    log::error!("Failed to send message over WebSocket: {:#?}", e);
                                    break;
                                }
                            }
                            Err(e) => {
                                log::error!("Failed to serialize event for WebSocket: {:#?}", e);
                            }
                        }
                    },
                    Err(RecvError::Lagged(skipped)) => {
                        log::warn!("Events broadcast lagged, skipped {} messages", skipped);
                    },
                    Err(RecvError::Closed) => {
                        log::info!("Events broadcast channel closed");
                        break;
                    }
                }
            },
            msg = receiver.next() => {
                match msg {
                    Some(Ok(Message::Close(_))) | None => {
                        log::info!("WebSocket client disconnected");
                        break;
                    },
                    Some(Err(e)) => {
                        log::error!("WebSocket receive error: {:#?}", e);
                        break;
                    },
                    _ => {}
                }
            }
        }
    }
}

pub async fn ws(ws: WebSocketUpgrade, Query(params): Query<WSParams>) -> impl IntoResponse {
    return ws.on_upgrade(|socket| handle_socket(socket, params.widget));
}
