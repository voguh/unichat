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
pub struct JsonRPCResponse {
    jsonrpc: String,
    id: String,
    result: serde_json::Value
}

impl JsonRPCResponse {
    pub fn new<R: Into<serde_json::Value>>(id: String, result: R) -> Self {
        let result = result.into();
        return JsonRPCResponse { jsonrpc: String::from("2.0"), id: id, result: result };
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
