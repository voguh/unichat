/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::sync::LazyLock;
use std::time::Duration;

use anyhow::Error;
use mlua::LuaSerdeExt as _;
use reqwest::StatusCode;
use reqwest::blocking::Client;
use reqwest::blocking::RequestBuilder;
use url::Url;

use crate::utils::base64;

/* ============================================================================================== */

struct ReqwestResponse {
    status: StatusCode,
    headers: reqwest::header::HeaderMap,
    url: Url,
    body: Option<String>,
}

impl ReqwestResponse {
    pub fn new(response: reqwest::blocking::Response) -> Self {
        return Self {
            status: response.status(),
            headers: response.headers().clone(),
            url: response.url().clone(),
            body: response.text().ok(),
        };
    }
}

impl mlua::UserData for ReqwestResponse {
    fn add_fields<F: mlua::UserDataFields<Self>>(fields: &mut F) {
        fields.add_field_method_get("ok", |_lua, this| {
            return Ok(this.status.is_success());
        });

        fields.add_field_method_get("status_text", |_lua, this| {
            return Ok(this.status.to_string());
        });

        fields.add_field_method_get("status_code", |_lua, this| {
            return Ok(this.status.as_u16());
        });

        fields.add_field_method_get("headers", |lua, this| {
            let table = lua.create_table()?;

            for (key, value) in this.headers.iter() {
                let key = key.to_string();
                let value = value.to_str().map(|str| str.to_string()).map_err(mlua::Error::external)?;
                table.set(key, value)?;
            }

            return Ok(table);
        });

        fields.add_field_method_get("url", |_lua, this| {
            return Ok(this.url.to_string());
        });
    }

    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("header", |_lua, this, key: String| {
            let headers = this.headers.clone();
            let header = headers.get(key);

            if let Some(header) = header {
                let value = header.to_str().map_err(mlua::Error::external)?;
                return Ok(Some(value.to_string()));
            } else {
                return Ok(None);
            }
        });

        methods.add_method_mut("text", |lua, this, ()| {
            if let Some(body) = &this.body {
                let lua_string = lua.create_string(body)?;
                return Ok(mlua::Value::String(lua_string));
            } else {
                return Ok(mlua::Value::Nil);
            }
        });

        methods.add_method_mut("json", |lua, this, ()| {
            if let Some(body) = &this.body {
                let value: serde_json::Value = serde_json::from_str(body).map_err(mlua::Error::external)?;
                let lua_value = lua.to_value(&value)?;
                return Ok(lua_value);
            } else {
                return Ok(mlua::Value::Nil);
            }
        });
    }
}

/* ============================================================================================== */

static REQWEST_CLIENT: LazyLock<Client> = LazyLock::new(|| {
    let client_builder = Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .timeout(Duration::from_secs(30));

    return client_builder.build().unwrap();
});

fn apply_args(mut builder: RequestBuilder, args: Option<mlua::Table>) -> Result<RequestBuilder, Error> {
    if let Some(args) = args {
        if let Ok(headers) = args.get::<mlua::Table>("headers") {
            for pair in headers.pairs::<String, String>() {
                let (key, value) = pair?;
                builder = builder.header(&key, &value);
            }
        }

        if let Ok(content_type) = args.get::<String>("content_type") {
            builder = builder.header("Content-Type", &content_type);
        }

        if let Ok(basic_auth) = args.get::<mlua::Table>("basic_auth") {
            let username: String = basic_auth.get("username")?;
            let password: String = basic_auth.get("password")?;
            let hash = base64::encode(format!("{}:{}", username, password));
            let hash = format!("Basic {}", hash);
            builder = builder.header("Authorization", &hash);
        }
    }

    return Ok(builder);
}

/* ============================================================================================== */

pub struct UniChatHttpModule;

impl UniChatHttpModule {
    pub fn new (lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
        let userdata = lua.create_userdata(UniChatHttpModule)?;
        return Ok(mlua::Value::UserData(userdata));
    }
}

impl mlua::UserData for UniChatHttpModule {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("get", |lua, _this, (uri, args): (String, Option<mlua::Table>)| {
            let mut request = REQWEST_CLIENT.get(uri);
            request = apply_args(request, args).map_err(|e| mlua::Error::external(e))?;

            let response = request.send().map_err(|e| mlua::Error::external(e))?;
            let userdata = lua.create_userdata(ReqwestResponse::new(response))?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("post", |lua, _this, (uri, body, args): (String, Option<mlua::Value>, Option<mlua::Table>)| {
            let mut request = REQWEST_CLIENT.post(uri);
            request = apply_args(request, args).map_err(|e| mlua::Error::external(e))?;

            if let Some(body) = body {
                match body {
                    mlua::Value::String(s) => {
                        request = request.body(s.to_string_lossy());
                    }
                    mlua::Value::Table(t) => {
                        let value: serde_json::Value = lua.from_value(mlua::Value::Table(t))?;
                        request = request.json(&value);
                    }
                    _ => {
                        return Err(mlua::Error::external("Invalid body type. Expected string or table."));
                    }
                }
            }

            let response = request.send().map_err(mlua::Error::external)?;
            let userdata = lua.create_userdata(ReqwestResponse::new(response))?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("put", |lua, _this, (uri, body, args): (String, Option<mlua::Value>, Option<mlua::Table>)| {
            let mut request = REQWEST_CLIENT.put(uri);
            request = apply_args(request, args).map_err(|e| mlua::Error::external(e))?;

            if let Some(body) = body {
                match body {
                    mlua::Value::String(s) => {
                        request = request.body(s.to_string_lossy());
                    }
                    mlua::Value::Table(t) => {
                        let value: serde_json::Value = lua.from_value(mlua::Value::Table(t))?;
                        request = request.json(&value);
                    }
                    _ => {
                        return Err(mlua::Error::external("Invalid body type. Expected string or table."));
                    }
                }
            }

            let response = request.send().map_err(mlua::Error::external)?;
            let userdata = lua.create_userdata(ReqwestResponse::new(response))?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("patch", |lua, _this, (uri, body, args): (String, Option<mlua::Value>, Option<mlua::Table>)| {
            let mut request = REQWEST_CLIENT.patch(uri);
            request = apply_args(request, args).map_err(|e| mlua::Error::external(e))?;

            if let Some(body) = body {
                match body {
                    mlua::Value::String(s) => {
                        request = request.body(s.to_string_lossy());
                    }
                    mlua::Value::Table(t) => {
                        let value: serde_json::Value = lua.from_value(mlua::Value::Table(t))?;
                        request = request.json(&value);
                    }
                    _ => {
                        return Err(mlua::Error::external("Invalid body type. Expected string or table."));
                    }
                }
            }

            let response = request.send().map_err(mlua::Error::external)?;
            let userdata = lua.create_userdata(ReqwestResponse::new(response))?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("delete", |lua, _this, (uri, args): (String, Option<mlua::Table>)| {
            let mut request = REQWEST_CLIENT.delete(uri);
            request = apply_args(request, args).map_err(|e| mlua::Error::external(e))?;

            let response = request.send().map_err(|e| mlua::Error::external(e))?;
            let userdata = lua.create_userdata(ReqwestResponse::new(response))?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("head", |lua, _this, (uri, args): (String, Option<mlua::Table>)| {
            let mut request = REQWEST_CLIENT.head(uri);
            request = apply_args(request, args).map_err(|e| mlua::Error::external(e))?;

            let response = request.send().map_err(|e| mlua::Error::external(e))?;
            let userdata = lua.create_userdata(ReqwestResponse::new(response))?;
            return Ok(mlua::Value::UserData(userdata));
        });
    }
}
