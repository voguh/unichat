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
pub struct JsonRPCRequest {
    jsonrpc: String,
    id: Option<String>,
    method: String,
    params: Option<Vec<serde_json::Value>>
}

impl JsonRPCRequest {
    pub fn new(method: String, id: Option<String>, params: Option<Vec<serde_json::Value>>) -> Self {
        return JsonRPCRequest { jsonrpc: String::from("2.0"), id: id, method: method, params: params };
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
