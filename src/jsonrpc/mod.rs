/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct JsonRPCRequest {
    jsonrpc: String,
    id: Option<String>,
    method: String,
    params: Option<Vec<serde_json::Value>>
}

impl JsonRPCRequest {
    pub fn new(method: String, id: Option<String>, params: Option<Vec<serde_json::Value>>) -> Self {
        return JsonRPCRequest {
            jsonrpc: String::from("2.0"),
            id: id,
            method: method,
            params: params
        };
    }

    /* ====================================================================== */

    pub fn jsonrpc(&self) -> String {
        return self.jsonrpc.clone();
    }

    pub fn id(&self) -> Option<String> {
        return self.id.clone();
    }

    pub fn method(&self) -> String {
        return self.method.clone();
    }

    pub fn params(&self) -> Option<Vec<serde_json::Value>> {
        return self.params.clone();
    }
}

/* ========================================================================== */

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct JsonRPCResponse {
    jsonrpc: String,
    id: String,
    result: serde_json::Value
}

impl JsonRPCResponse {
    pub fn new<R: Into<serde_json::Value>>(id: String, result: R) -> Self {
        let result = result.into();
        return JsonRPCResponse {
            jsonrpc: String::from("2.0"),
            id: id,
            result: result
        };
    }

    /* ====================================================================== */

    pub fn jsonrpc(&self) -> String {
        return self.jsonrpc.clone();
    }

    pub fn id(&self) -> String {
        return self.id.clone();
    }

    pub fn result(&self) -> serde_json::Value {
        return self.result.clone();
    }
}

/* ========================================================================== */

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct JsonRPCError {
    jsonrpc: String,
    id: Option<String>,
    error: JsonRPCErrorDetail
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct JsonRPCErrorDetail {
    code: i32,
    message: String,
    data: Option<serde_json::Value>
}

impl JsonRPCError {
    pub fn parse_error<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail {
                code: -32700,
                message: String::from("Parse error"),
                data: data
            }
        };
    }

    pub fn invalid_request<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail {
                code: -32600,
                message: String::from("Invalid Request"),
                data: data
            }
        };
    }

    pub fn method_not_found<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail {
                code: -32601,
                message: String::from("Method not found"),
                data: data
            }
        };
    }

    pub fn invalid_params<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail {
                code: -32602,
                message: String::from("Invalid params"),
                data: data
            }
        };
    }

    pub fn internal_error<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail {
                code: -32603,
                message: String::from("Internal error"),
                data: data
            }
        };
    }

    pub fn server_error<D: Into<serde_json::Value>>(id: Option<String>, code: i32, message: String, data: Option<D>) -> Self {
        if code >= -32000 || code <= -32099 {
            panic!("Server error code must be in the range -32000 to -32099");
        }

        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail {
                code: code,
                message: message,
                data: data
            }
        };
    }

    /* ====================================================================== */

    pub fn jsonrpc(&self) -> String {
        return self.jsonrpc.clone();
    }

    pub fn id(&self) -> Option<String> {
        return self.id.clone();
    }

    pub fn error(&self) -> JsonRPCErrorDetail {
        return self.error.clone();
    }
}

impl JsonRPCErrorDetail {
    pub fn code(&self) -> i32 {
        return self.code;
    }

    pub fn message(&self) -> String {
        return self.message.clone();
    }

    pub fn data(&self) -> Option<serde_json::Value> {
        return self.data.clone();
    }
}
