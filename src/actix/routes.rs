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
use std::path;
use std::path::PathBuf;

use actix_web::error::ErrorBadRequest;
use actix_web::error::ErrorNotFound;
use actix_web::get;
use actix_web::http::StatusCode;
use actix_web::web;
use actix_web::HttpRequest;
use actix_web::HttpResponse;
use actix_web::Responder;

use crate::events;
use crate::events::event_emitter;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::ureq;

static WIDGET_TEMPLATE: &str = include_str!("./static/index.html.template");

fn safe_guard_path(base_path: &PathBuf, concat_str: &str) -> Result<PathBuf, actix_web::Error> {
    let concatenated_path = base_path.join(concat_str);
    let resolved_path = path::absolute(concatenated_path).map_err(|e| {
        log::error!("{:?}", e);
        return ErrorNotFound("Path not found");
    })?;
    if !resolved_path.starts_with(base_path) {
        return Err(ErrorBadRequest(format!("Access to path '{}' is not allowed", resolved_path.display())));
    }

    return Ok(resolved_path);
}

fn get_widget_dir(widget_name: &str) -> Option<PathBuf> {
    let widget_name = widget_name.trim();

    if widget_name.is_empty() || widget_name.starts_with(".") {
        return None;
    }

    let system_widgets_dir = properties::get_app_path(AppPaths::UniChatSystemWidget);
    let system_widget_path = system_widgets_dir.join(widget_name);
    if system_widget_path.exists() {
        return Some(system_widget_path);
    }

    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    let user_widget_path = user_widgets_dir.join(widget_name);
    if user_widget_path.exists() {
        return Some(user_widget_path);
    }

    return None;
}

fn load_fieldstate(widget_path: &PathBuf) -> Result<HashMap<String, serde_json::Value>, Box<dyn std::error::Error>> {
    let fields_path = widget_path.join("fields.json");
    let fields_raw = fs::read_to_string(fields_path).unwrap_or(String::from("{}"));
    let fields_map: HashMap<String, serde_json::Value> = serde_json::from_str(&fields_raw)?;

    let fieldstate_path = widget_path.join("fieldstate.json");
    let fieldstate_raw = fs::read_to_string(fieldstate_path).unwrap_or(String::from("{}"));
    let fieldstate_map: HashMap<String, serde_json::Value> = serde_json::from_str(&fieldstate_raw)?;

    let mut final_fieldstate: HashMap<String, serde_json::Value> = HashMap::new();

    for (key, value) in fields_map.iter() {
        if !value.is_object() {
            continue;
        }

        if let Some(state_value) = fieldstate_map.get(key) {
            final_fieldstate.insert(key.clone(), state_value.clone());
        } else {
            let obj = value.as_object().ok_or("Invalid field definition")?;
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
    let asset_full_path = safe_guard_path(&assets_path, &asset_path)?;
    if !asset_full_path.exists() {
        return Err(ErrorNotFound(format!("Asset '{}' not found", asset_path)));
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
}

/* ================================================================================================================== */

#[get("/widget/{name}/assets/{path:.*}")]
pub async fn get_widget_assets(req: HttpRequest) -> Result<impl Responder, actix_web::Error> {
    let widget_name: String = req.match_info().query("name").parse()?;

    let asset_path: String = req.match_info().query("path").parse()?;
    if asset_path.trim().is_empty() {
        return Err(ErrorBadRequest("Asset path cannot be empty"));
    }

    if let Some(widget_path) = get_widget_dir(&widget_name) {
        let widget_assets_path = widget_path.join("assets");
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

    if let Some(widget_path) = get_widget_dir(&widget_name) {
        let html = fs::read_to_string(widget_path.join("main.html")).unwrap_or_default();
        let js = fs::read_to_string(widget_path.join("script.js")).unwrap_or_default();
        let css = fs::read_to_string(widget_path.join("style.css")).unwrap_or_default();

        let mut content = String::from(WIDGET_TEMPLATE);
        content = content.replace("{{WIDGET_STYLE}}", &css);
        content = content.replace("{{WIDGET_SCRIPT}}", &js);
        content = content.replace("{{WIDGET_HTML}}", &html);

        let fieldstate = load_fieldstate(&widget_path).unwrap_or_default();
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

#[get("/ws")]
pub async fn ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, actix_web::Error> {
    let (res, mut session, _stream) = actix_ws::handle(&req, stream)?;

    actix_web::rt::spawn(async move {
        if let Err(err) = session.ping(b"ping").await {
            log::error!("Failed to send ping to WebSocket: {}", err);
            return;
        }

        /* ====================================================================================== */

        let history = event_emitter().latest_events();
        let event = serde_json::json!({ "type": "unichat:history", "data": serde_json::to_value(history).unwrap_or_default() });
        if let Ok(parsed) = serde_json::to_string(&event) {
            if let Err(err) = session.text(parsed).await {
                log::error!("Failed to send load event to WebSocket: {}", err);
            }
        } else {
            log::error!("Failed to serialize load event");
        }

        /* ====================================================================================== */

        let mut rx = events::event_emitter().subscribe();

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
