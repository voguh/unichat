/*!******************************************************************************
 * UniChat
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use mlua::LuaSerdeExt as _;

use crate::utils::base64;
use crate::utils::ureq;
use crate::utils::ureq::http::response::Response;
use crate::utils::ureq::RequestBuilder;
use crate::utils::ureq::ResponseExt as _;

/* ============================================================================================== */

struct UreqResponse {
    response: Response<ureq::Body>
}

impl mlua::UserData for UreqResponse {
    fn add_fields<F: mlua::UserDataFields<Self>>(fields: &mut F) {
        fields.add_field_method_get("ok", |_lua, this| {
            let status = this.response.status();
            let ok = status.is_success();
            return Ok(ok);
        });

        fields.add_field_method_get("status_text", |_lua, this| {
            let status = this.response.status();
            let text = status.canonical_reason().unwrap_or("").to_string();
            return Ok(text);
        });

        fields.add_field_method_get("status_code", |_lua, this| {
            let status = this.response.status();
            let code = status.as_u16();
            return Ok(code);
        });

        fields.add_field_method_get("headers", |lua, this| {
            let table = lua.create_table()?;

            for (key, value) in this.response.headers().iter() {
                let key = key.to_string();
                let value = value.to_str().map_err(mlua::Error::external)?;
                let value = value.to_string();
                table.set(key, value)?;
            }

            return Ok(table);
        });

        fields.add_field_method_get("url", |_lua, this| {
            let url = this.response.get_uri().to_string();
            return Ok(url);
        });
    }

    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("header", |_lua, this, key: String| {
            let headers = this.response.headers();
            let header = headers.get(key);

            if let Some(header) = header {
                let value = header.to_str().map_err(mlua::Error::external)?;
                return Ok(Some(value.to_string()));
            } else {
                return Ok(None);
            }
        });

        methods.add_method_mut("text", |_lua, this, ()| {
            let text = this.response.body_mut().read_to_string().map_err(mlua::Error::external)?;
            return Ok(text);
        });

        methods.add_method_mut("json", |lua, this, ()| {
            let value: serde_json::Value = this.response.body_mut().read_json().map_err(mlua::Error::external)?;
            let table: mlua::Value = lua.to_value(&value)?;
            return Ok(table);
        });

        methods.add_method_mut("bytes", |_lua, this, ()| {
            let bytes = this.response.body_mut().read_to_vec().map_err(mlua::Error::external)?;
            return Ok(bytes);
        });
    }
}

/* ============================================================================================== */

fn apply_args<B>(builder: RequestBuilder<B>, args: Option<mlua::Table>) -> Result<RequestBuilder<B>, mlua::Error> {
    let mut builder = builder;

    if let Some(args) = args {
        if let Ok(headers) = args.get::<mlua::Table>("headers") {
            for pair in headers.pairs::<String, String>() {
                let (key, value) = pair?;
                builder = builder.header(&key, &value);
            }
        }

        if let Ok(query_params) = args.get::<mlua::Table>("query_params") {
            for pair in query_params.pairs::<String, String>() {
                let (key, value) = pair?;
                builder = builder.query(&key, &value);
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
            let mut request = ureq::get(uri);
            request = apply_args(request, args)?;

            let response = request.call().map_err(mlua::Error::external)?;
            let userdata = lua.create_userdata(UreqResponse { response })?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("post", |lua, _this, (uri, body, args): (String, Option<mlua::Value>, Option<mlua::Table>)| {
            let mut request = ureq::post(uri);
            request = apply_args(request, args)?;

            let response;
            if let Some(body) = body {
                match body {
                    mlua::Value::String(s) => {
                        let body = s.to_string_lossy();
                        response = request.send(&body).map_err(mlua::Error::external)?;
                    }
                    mlua::Value::Table(t) => {
                        let value: serde_json::Value = lua.from_value(mlua::Value::Table(t))?;
                        response = request.send_json(&value).map_err(mlua::Error::external)?;
                    }
                    _ => {
                        return Err(mlua::Error::external("Invalid body type. Expected string or table."));
                    }
                }
            } else {
                response = request.send_empty().map_err(mlua::Error::external)?;
            }

            let userdata = lua.create_userdata(UreqResponse { response })?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("put", |lua, _this, (uri, body, args): (String, Option<mlua::Value>, Option<mlua::Table>)| {
            let mut request = ureq::put(uri);
            request = apply_args(request, args)?;

            let response;
            if let Some(body) = body {
                match body {
                    mlua::Value::String(s) => {
                        let body = s.to_string_lossy();
                        response = request.send(&body).map_err(mlua::Error::external)?;
                    }
                    mlua::Value::Table(t) => {
                        let value: serde_json::Value = lua.from_value(mlua::Value::Table(t))?;
                        response = request.send_json(&value).map_err(mlua::Error::external)?;
                    }
                    _ => {
                        return Err(mlua::Error::external("Invalid body type. Expected string or table."));
                    }
                }
            } else {
                response = request.send_empty().map_err(mlua::Error::external)?;
            }

            let userdata = lua.create_userdata(UreqResponse { response })?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("patch", |lua, _this, (uri, body, args): (String, Option<mlua::Value>, Option<mlua::Table>)| {
            let mut request = ureq::patch(uri);
            request = apply_args(request, args)?;

            let response;
            if let Some(body) = body {
                match body {
                    mlua::Value::String(s) => {
                        let body = s.to_string_lossy();
                        response = request.send(&body).map_err(mlua::Error::external)?;
                    }
                    mlua::Value::Table(t) => {
                        let value: serde_json::Value = lua.from_value(mlua::Value::Table(t))?;
                        response = request.send_json(&value).map_err(mlua::Error::external)?;
                    }
                    _ => {
                        return Err(mlua::Error::external("Invalid body type. Expected string or table."));
                    }
                }
            } else {
                response = request.send_empty().map_err(mlua::Error::external)?;
            }

            let userdata = lua.create_userdata(UreqResponse { response })?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("delete", |lua, _this, (uri, args): (String, Option<mlua::Table>)| {
            let mut request = ureq::delete(uri);
            request = apply_args(request, args)?;

            let response = request.call().map_err(mlua::Error::external)?;
            let userdata = lua.create_userdata(UreqResponse { response })?;
            return Ok(mlua::Value::UserData(userdata));
        });

        methods.add_method("head", |lua, _this, (uri, args): (String, Option<mlua::Table>)| {
            let mut request = ureq::head(uri);
            request = apply_args(request, args)?;

            let response = request.call().map_err(mlua::Error::external)?;
            let userdata = lua.create_userdata(UreqResponse { response })?;
            return Ok(mlua::Value::UserData(userdata));
        });
    }
}
