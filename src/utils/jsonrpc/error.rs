/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct JsonRPCErrorDetail {
    code: i32,
    message: String,
    data: Option<serde_json::Value>
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

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct JsonRPCError {
    jsonrpc: String,
    id: Option<String>,
    error: JsonRPCErrorDetail
}

impl JsonRPCError {
    pub fn parse_error<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail { code: -32700, message: String::from("Parse error"), data: data }
        };
    }

    pub fn invalid_request<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail { code: -32600, message: String::from("Invalid Request"), data: data }
        };
    }

    pub fn method_not_found<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail { code: -32601, message: String::from("Method not found"), data: data }
        };
    }

    pub fn invalid_params<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail { code: -32602, message: String::from("Invalid params"), data: data }
        };
    }

    pub fn internal_error<D: Into<serde_json::Value>>(id: Option<String>, data: Option<D>) -> Self {
        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail { code: -32603, message: String::from("Internal error"), data: data }
        };
    }

    pub fn server_error<D: Into<serde_json::Value>>(
        id: Option<String>,
        code: i32,
        message: String,
        data: Option<D>
    ) -> Self {
        if !(-32099..=-32000).contains(&code) {
            panic!("Server error code {} out of range", code);
        }

        let data = data.map(|d| d.into());
        return JsonRPCError {
            jsonrpc: String::from("2.0"),
            id: id,
            error: JsonRPCErrorDetail { code: code, message: message, data: data }
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
