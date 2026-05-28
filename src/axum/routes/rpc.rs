/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use axum::body::Body;
use axum::body::Bytes;
use axum::response::Response;

use crate::utils::jsonrpc::JsonRPCError;
use crate::utils::jsonrpc::JsonRPCRequest;
use crate::utils::jsonrpc::JsonRPCResponse;
use crate::utils::userstore;

fn process_rpc_request(body: JsonRPCRequest) -> Result<JsonRPCResponse, JsonRPCError> {
    if body.jsonrpc() != "2.0" {
        return Err(JsonRPCError::invalid_request(body.id(), Some("Invalid JSON-RPC version")));
    }

    let id = body.id();
    let method = body.method();

    match method.as_str() {
        "userstore:get" => {
            if let Some(ok) = id {
                let params = body.params().unwrap_or_default();
                if params.len() != 1 {
                    return Err(JsonRPCError::invalid_params(Some(ok.to_string()), Some("Expected exactly 1 parameter for 'userstore:get'")));
                }

                let key: &str;
                match params[0].as_str() {
                    Some(k) => key = k,
                    None => {
                        return Err(JsonRPCError::invalid_params(Some(ok.to_string()), Some("Parameter for 'userstore:get' must be a string")));
                    }
                }

                match userstore::get_item::<Option<String>>(key) {
                    Ok(value) => {
                        return Ok(JsonRPCResponse::new(ok.to_string(), value));
                    }
                    Err(e) => {
                        return Err(JsonRPCError::internal_error(Some(ok.to_string()), Some(format!("{:#?}", e))));
                    }
                }
            } else {
                return Err(JsonRPCError::invalid_request(None, Some("Missing id in JSON-RPC request")));
            }
        }
        _ => {
            return Err(JsonRPCError::method_not_found(id, Some(format!("Method '{}' not found", method))));
        }

    }
}

pub async fn rpc(body: Bytes) -> Response {
    let rpc_request: JsonRPCRequest;
    match serde_json::from_slice(&body) {
        Ok(req) => rpc_request = req,
        Err(e) => {
            let error_response = JsonRPCError::parse_error(None, Some(format!("{:#?}", e)));
            let body_str = serde_json::to_string(&error_response).unwrap();
            return Response::builder()
                .status(200)
                .header("Content-Type", "application/json")
                .body(Body::from(body_str))
                .unwrap();
        }
    }

    let body_str: String;
    match process_rpc_request(rpc_request) {
        Ok(response) => body_str = serde_json::to_string(&response).unwrap(),
        Err(err) => body_str = serde_json::to_string(&err).unwrap()
    }

    return Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .body(Body::from(body_str))
        .unwrap();
}
