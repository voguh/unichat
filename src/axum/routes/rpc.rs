/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

#![allow(clippy::result_large_err)]

use axum::Json;
use axum::body::Bytes;
use axum::response::IntoResponse as _;
use axum::response::Response;

use crate::utils::jsonrpc::JsonRPCError;
use crate::utils::jsonrpc::JsonRPCRequest;
use crate::utils::jsonrpc::JsonRPCResponse;
use crate::utils::userstore;

/* ========================================================================== */

fn userstore_get(id: Option<String>, body: &JsonRPCRequest) -> Result<JsonRPCResponse, JsonRPCError> {
    let id = id.ok_or_else(|| JsonRPCError::invalid_request(None, Some("Missing id in JSON-RPC request")))?;

    let params = body.params().unwrap_or_default();
    if params.len() != 1 {
        let message = "Expected exactly 1 parameter for 'userstore:get'";
        return Err(JsonRPCError::invalid_params(Some(id), Some(message)));
    }

    let key: &str;
    match params[0].as_str() {
        Some(param) => key = param,
        None => {
            let message = "Parameter for 'userstore:get' must be a string";
            return Err(JsonRPCError::invalid_params(Some(id), Some(message)));
        }
    }

    return match userstore::get_item::<String>(key) {
        Ok(value) => Ok(JsonRPCResponse::new(id, value)),
        Err(err) => {
            let message = format!("{:#?}", err);
            return Err(JsonRPCError::internal_error(Some(id), Some(message)));
        }
    };
}

fn process_rpc_request(body: JsonRPCRequest) -> Result<JsonRPCResponse, JsonRPCError> {
    let id = body.id().map(String::from);
    if body.jsonrpc() != "2.0" {
        return Err(JsonRPCError::invalid_request(id, Some("Invalid JSON-RPC version")));
    }

    let method = body.method();
    if method == "userstore:get" {
        return userstore_get(id, &body);
    }

    let message = format!("Method '{}' not found", method);
    return Err(JsonRPCError::method_not_found(id, Some(message)));
}

pub async fn rpc(body: Bytes) -> Response {
    let rpc_request: JsonRPCRequest;
    match serde_json::from_slice(&body) {
        Ok(request) => rpc_request = request,
        Err(err) => {
            let error_response = JsonRPCError::parse_error(None, Some(format!("{:#?}", err)));
            return Json(error_response).into_response();
        }
    }

    return match process_rpc_request(rpc_request) {
        Ok(response) => Json(response).into_response(),
        Err(err) => Json(err).into_response()
    };
}
