/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;
use std::io::Read as _;
use std::path::PathBuf;

use actix_web::error::ErrorBadRequest;
use actix_web::error::ErrorInternalServerError;
use actix_web::error::ErrorNotFound;
use actix_web::get;
use actix_web::http::StatusCode;
use actix_web::HttpRequest;
use actix_web::HttpResponse;
use actix_web::Responder;
use actix_web::web;
use anyhow::anyhow;
use anyhow::Error;

use crate::events;
use crate::plugins;
use crate::utils;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::ureq;
use crate::utils::userstore;
use crate::widgets::WidgetMetadata;
use crate::widgets::get_widget_from_rest_path;

static WIDGET_TEMPLATE: &str = include_str!("./static/index.html.template");

fn safe_guard_path(base_path: &PathBuf, concat_str: &str) -> Result<PathBuf, actix_web::Error> {
    return utils::safe_guard_path(base_path, concat_str).map_err(|e| {
        log::error!("{:#?}", e);
        return ErrorInternalServerError("Failed to resolve asset path safely");
    });
}

fn load_fieldstate(widget: &WidgetMetadata) -> Result<HashMap<String, serde_json::Value>, Error> {
    let fields_map = widget.fields();
    let fieldstate_map = widget.fieldstate();

    let mut final_fieldstate: HashMap<String, serde_json::Value> = HashMap::new();

    for (key, value) in fields_map.iter() {
        if !value.is_object() {
            continue;
        }

        if let Some(state_value) = fieldstate_map.get(key) {
            final_fieldstate.insert(key.clone(), state_value.clone());
        } else {
            let obj = value.as_object().ok_or(anyhow!("Invalid field definition"))?;
            if let Some(default_value) = obj.get("value") {
                final_fieldstate.insert(key.clone(), default_value.clone());
            }
        }
    }

    return Ok(final_fieldstate);
}

/* ================================================================================================================== */

#[cfg(target_os = "windows")]
static USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0";

#[cfg(target_os = "linux")]
static USER_AGENT: &str = "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0";

#[get("/ytimg/{path:.*}")]
pub async fn ytimg(req: HttpRequest) -> Result<impl Responder, actix_web::Error> {
    let asset_path: String = req.match_info().query("path").parse()?;
    if asset_path.trim().is_empty() {
        return Err(ErrorBadRequest("Asset path cannot be empty"));
    }

    let mut response = ureq::get(format!("https://yt3.ggpht.com/{}", asset_path))
        .header("User-Agent", USER_AGENT)
        .header("Referer", "https://www.youtube.com/")
        .call()
        .map_err(|e| {
            log::error!("{:?}", e);
            return ErrorNotFound(format!("Failed to fetch asset '{}'", asset_path));
        })?;

    let body = response.body_mut();
    let mut reader = body.as_reader();
    let mut buffer = Vec::new();
    reader.read_to_end(&mut buffer).map_err(|e| {
        log::error!("{:?}", e);
        return ErrorNotFound(format!("Failed to read asset '{}'", asset_path));
    })?;

    let content_type = response.headers().get("Content-Type");
    let mut content_type_str = "application/octet-stream";
    if let Some(content_type) = content_type {
        content_type_str = content_type.to_str().map_err(|e| {
            log::error!("{:?}", e);
            return ErrorNotFound(format!("Failed to read Content-Type for asset '{}'", asset_path));
        })?;
    }

    let response = HttpResponse::build(StatusCode::OK)
        .content_type(content_type_str)
        .insert_header(("Cache-Control", "max-age=3600"))
        .body(buffer);

    return Ok(response);
}

/* ================================================================================================================== */

#[get("/assets/{path:.*}")]
pub async fn get_assets(req: HttpRequest) -> Result<impl Responder, actix_web::Error> {
    let asset_path: String = req.match_info().query("path").parse()?;
    if asset_path.trim().is_empty() {
        return Err(ErrorBadRequest("Asset path cannot be empty"));
    }

    let assets_path = properties::get_app_path(AppPaths::UniChatAssets);
    let mut asset_full_path = safe_guard_path(&assets_path, &asset_path)?;

    let first_part = asset_path.split('/').next().unwrap_or("");
    let plugins = plugins::get_plugins().map_err(|e| ErrorInternalServerError(e))?;
    if let Some(plugin) = plugins.iter().find(|p| p.name == first_part) {
        let plugin_assets_path = plugin.get_assets_path();
        if !plugin_assets_path.is_dir() {
            return Err(ErrorNotFound(format!("Plugin '{}' does not have an assets directory", plugin.name)));
        }

        let relative_asset_path = asset_path.trim_start_matches(first_part).trim_start_matches('/');
        asset_full_path = safe_guard_path(&plugin_assets_path, relative_asset_path)?;
    }

    if !asset_full_path.exists() {
        return Err(ErrorNotFound(format!("Asset '{}' not found", asset_path)));
    }

    let content = fs::read(&asset_full_path).map_err(|e| {
        log::error!("{:?}", e);
        return ErrorNotFound(format!("Failed to read asset '{}'", asset_path));
    })?;

    if let Some(kind) = infer::get(&content) {
        let mime = kind.mime_type();
        return Ok(HttpResponse::build(StatusCode::OK).content_type(mime).body(content));
    } else if let Some(kind) = mime_guess::from_path(&asset_full_path).first() {
        let mime = kind.essence_str();
        return Ok(HttpResponse::build(StatusCode::OK).content_type(mime).body(content));
    } else {
        return Err(ErrorBadRequest(format!("Could not infer MIME type for asset '{}'", asset_path)));
    }
}

/* ================================================================================================================== */

#[get("/widget/{name}/assets/{path:.*}")]
pub async fn get_widget_assets(req: HttpRequest) -> Result<impl Responder, actix_web::Error> {
    let widget_name: String = req.match_info().query("name").parse()?;
    if widget_name.trim().is_empty() {
        return Err(ErrorBadRequest("Widget name cannot be empty"));
    }

    let asset_path: String = req.match_info().query("path").parse()?;
    if asset_path.trim().is_empty() {
        return Err(ErrorBadRequest("Asset path cannot be empty"));
    }

    if let Ok(widget) = get_widget_from_rest_path(&widget_name) {
        let widget_assets_path = widget.assets_path();

        let asset_full_path = safe_guard_path(&widget_assets_path, &asset_path)?;
        if !asset_full_path.exists() {
            return Err(ErrorNotFound(format!("Asset '{}' not found in widget '{}'", asset_path, widget_name)));
        } else if asset_full_path.is_dir() {
            return Err(ErrorBadRequest(format!("Asset '{}' is a directory, not a file", asset_path)));
        }

        let content = fs::read(&asset_full_path).map_err(|e| {
            log::error!("{:?}", e);
            return ErrorNotFound(format!("Failed to read asset '{}'", asset_path));
        })?;

        if let Some(kind) = infer::get(&content) {
            return Ok(HttpResponse::build(StatusCode::OK).content_type(kind.mime_type()).body(content));
        } else {
            return Err(ErrorBadRequest(format!("Could not infer MIME type for asset '{}'", asset_path)));
        }
    } else {
        return Err(ErrorNotFound(format!("Widget '{}' not found", widget_name)));
    }
}

#[get("/widget/{name}")]
pub async fn get_widget(req: HttpRequest) -> Result<impl Responder, actix_web::Error> {
    let widget_name: String = req.match_info().query("name").parse()?;
    if widget_name.trim().is_empty() {
        return Err(ErrorBadRequest("Widget name cannot be empty"));
    }

    if let Ok(widget) = get_widget_from_rest_path(&widget_name) {
        let html = widget.widget_html();
        let js = widget.widget_js();
        let css = widget.widget_css();

        let mut content = String::from(WIDGET_TEMPLATE);
        content = content.replace("{{WIDGET_STYLE}}", &css);
        content = content.replace("{{WIDGET_SCRIPT}}", &js);
        content = content.replace("{{WIDGET_HTML}}", &html);

        let info = req.connection_info();
        let base_url = format!("{}://{}/widget/{}/", info.scheme(), info.host(), widget_name);
        content = content.replace("{{WIDGET_BASE_URL}}", &base_url);

        let fieldstate = load_fieldstate(&widget).unwrap_or_default();
        for (key, value) in fieldstate.iter() {
            let value_str = serde_plain::to_string(value).map_err(|e| {
                log::error!("{:?}", e);
                return ErrorBadRequest("Failed to serialize field state value");
            })?;
            content = content.replace(&format!("{{{{{}}}}}", key), &value_str);
            content = content.replace(&format!("{{{}}}", key), &value_str);
        }

        return Ok(HttpResponse::build(StatusCode::OK).content_type("text/html; charset=utf-8").body(content));
    } else {
        return Err(actix_web::error::ErrorNotFound(format!("Widget '{}' not found", widget_name)));
    }
}

/* ================================================================================================================== */

#[get("/gallery/{name}")]
pub async fn gallery(req: HttpRequest) -> Result<impl Responder, actix_web::Error> {
    let asset_name: String = req.match_info().query("name").parse()?;
    let gallery_path = properties::get_app_path(AppPaths::UniChatGallery);

    let asset_full_path = safe_guard_path(&gallery_path, &asset_name)?;
    if !asset_full_path.exists() {
        return Err(ErrorNotFound(format!("Gallery Item '{}' not found", asset_name)));
    } else if asset_full_path.is_dir() {
        return Err(ErrorBadRequest(format!("Gallery Item '{}' is a directory, not a file", asset_name)));
    }

    let content = fs::read(&asset_full_path).map_err(|e| {
        log::error!("{:?}", e);
        return ErrorNotFound(format!("Failed to read asset '{}'", asset_name));
    })?;

    if let Some(kind) = infer::get(&content) {
        return Ok(HttpResponse::build(StatusCode::OK).content_type(kind.mime_type()).body(content));
    } else {
        return Err(ErrorBadRequest(format!("Could not infer MIME type for gallery item '{}'", asset_name)));
    }
}

/* ================================================================================================================== */

#[get("/ws")]
pub async fn ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, actix_web::Error> {
    let (res, mut session, _stream) = actix_ws::handle(&req, stream)?;

    actix_web::rt::spawn(async move {
        if let Err(err) = session.ping(b"ping").await {
            log::error!("Failed to send ping to WebSocket: {}", err);
            return;
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

        let userstore_data = userstore::get_all_items().unwrap_or_default();
        let userstore_event = serde_json::json!({ "type": "unichat:user_store_loaded", "data": userstore_data });
        if let Ok(parsed) = serde_json::to_string(&userstore_event) {
            if let Err(err) = session.text(parsed).await {
                log::error!("Failed to send UserStore load event to WebSocket: {}", err);
            }
        } else {
            log::error!("Failed to serialize UserStore load event");
        }

        /* ====================================================================================== */

        let mut rx = events::subscribe().unwrap();

        loop {
            let received = rx.recv().await;

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

        let _ = session.close(None).await;
        drop(rx);
        log::info!("WebSocket session closed");
    });

    return Ok(res);
}
