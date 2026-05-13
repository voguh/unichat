/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use actix_web::HttpRequest;
use actix_web::HttpResponse;
use actix_web::get;
use actix_web::web::Payload;
use futures::StreamExt as _;

use crate::events;
use crate::utils::jsonrpc::JsonRPCError;
use crate::utils::jsonrpc::JsonRPCRequest;
use crate::utils::jsonrpc::JsonRPCResponse;
use crate::utils::userstore;

fn process_jsonrpc_request(message: &str) -> Result<Option<JsonRPCResponse>, JsonRPCError> {
    let rpc: JsonRPCRequest = serde_json::from_str(message).map_err(|e| {
        log::error!("{:#?}", e);
        return JsonRPCError::parse_error(None, Some(format!("{:#?}", e)));
    })?;

    let id = rpc.id().as_deref().map(|s| s.to_string());
    let method = rpc.method().to_string();

    if rpc.jsonrpc() != "2.0" {
        return Err(JsonRPCError::invalid_request(id, Some("Invalid JSON-RPC version")));
    }

    match method.as_str() {
        "userstore:get" => {
            let id = id.ok_or(JsonRPCError::invalid_request(None, Some("Missing id in JSON-RPC request")))?;

            let params = rpc.params().unwrap_or_default();
            if params.len() != 1 {
                log::error!("JSON-RPC method 'userstore:get' called with invalid number of parameters");
                return Err(JsonRPCError::invalid_params(Some(id), Some("Expected exactly 1 parameter for 'userstore:get'")));
            }

            let key = match params[0].as_str() {
                Some(k) => k,
                None => {
                    log::error!("JSON-RPC method 'userstore:get' called with invalid parameter type");
                    return Err(JsonRPCError::invalid_params(Some(id), Some("Expected parameter 1 to be a string")));
                }
            };

            match userstore::get_item::<Option<String>>(key) {
                Ok(value) => {
                    let response = JsonRPCResponse::new(id, value);
                    return Ok(Some(response));
                }
                Err(e) => {
                    log::error!("{:#?}", e);
                    return Err(JsonRPCError::internal_error(Some(id), Some(format!("{:#?}", e))));
                }
            }
        }
        _ => {
            log::error!("Method '{}' not found", rpc.method());
            return Err(JsonRPCError::method_not_found(id, Some(format!("Method '{}' not found", method))));
        }
    }
}

#[get("/ws")]
pub async fn ws(req: HttpRequest, stream: Payload) -> Result<HttpResponse, actix_web::Error> {
    let (res, mut session, mut msg_stream) = actix_ws::handle(&req, stream)?;

    actix_web::rt::spawn(async move {
        if let Err(err) = session.ping(b"ping").await {
            log::error!("Failed to send ping to WebSocket: {}", err);
            return;
        }

        /* ====================================================================================== */

        let userstore_data = userstore::get_all_items().unwrap_or_default();
        let userstore_event = serde_json::json!({ "type": "unichat:connected", "data": { "userstore": userstore_data } });
        if let Ok(parsed) = serde_json::to_string(&userstore_event) {
            if let Err(err) = session.text(parsed).await {
                log::error!("Failed to send UserStore load event to WebSocket: {}", err);
            }
        } else {
            log::error!("Failed to serialize UserStore load event");
        }

        /* ====================================================================================== */

        let history_data = events::latest_events();
        let history_event = serde_json::json!({ "type": "unichat:history", "data": history_data });
        if let Ok(parsed) = serde_json::to_string(&history_event) {
            if let Err(err) = session.text(parsed).await {
                log::error!("Failed to send load event to WebSocket: {}", err);
            }
        } else {
            log::error!("Failed to serialize load event");
        }

        /* ====================================================================================== */

        let mut rx = events::subscribe().unwrap();

        loop {
            tokio::select! {
                received = rx.recv() => {
                    match received {
                        Ok(event) => {
                            if let Ok(parsed) = serde_json::to_string(&event) {
                                if let Err(err) = session.text(parsed).await {
                                    log::error!("Failed to send event to WebSocket: {}", err);
                                    break;
                                }
                            } else {
                                log::error!("Failed to serialize event");
                            }
                        }
                        Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped)) => {
                            log::warn!("WebSocket receiver lagged, skipped {} messages", skipped);
                        }
                        Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                            log::info!("WebSocket receiver closed, exiting loop");
                            break;
                        }
                    }
                }

                msg = msg_stream.next() => {
                    match msg {
                        Some(Ok(actix_ws::Message::Text(text))) => {
                            match process_jsonrpc_request(&text) {
                                Ok(Some(response)) => {
                                    match serde_json::to_string(&response) {
                                        Ok(response_str) => {
                                            if let Err(send_err) = session.text(response_str).await {
                                                log::error!("Failed to send JSON-RPC response to WebSocket: {:#?}", send_err);
                                            }
                                        },
                                        Err(ser_err) => {
                                            log::error!("Failed to serialize JSON-RPC response: {:#?}", ser_err);
                                        }
                                    }
                                },
                                Ok(None) => {},
                                Err(err) => {
                                    match serde_json::to_string(&err) {
                                        Ok(err_str) => {
                                            if let Err(send_err) = session.text(err_str).await {
                                                log::error!("Failed to send JSON-RPC error to WebSocket: {:#?}", send_err);
                                            }
                                        },
                                        Err(ser_err) => {
                                            log::error!("Failed to serialize JSON-RPC error: {:#?}", ser_err);
                                        }
                                    }
                                }
                            }
                        },
                        Some(Ok(actix_ws::Message::Ping(bytes))) => {
                            if let Err(err) = session.pong(&bytes).await {
                                log::error!("Failed to send Pong to WebSocket: {:#?}", err);
                                break;
                            }
                        }
                        Some(Ok(actix_ws::Message::Close(reason))) => {
                            log::info!("WebSocket closed: {:?}", reason);
                            break;
                        }
                        Some(Err(err)) => {
                            log::error!("Erro ao ler WS: {:#?}", err); break;
                        }
                        None => {
                            break;
                        }
                        _ => {}
                    }
                }
            }
        }

        let _ = session.close(None).await;
        drop(rx);
        log::info!("WebSocket session closed");
    });

    return Ok(res);
}
