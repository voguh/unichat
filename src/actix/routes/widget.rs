/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use actix_web::HttpRequest;
use actix_web::HttpResponse;
use actix_web::Responder;
use actix_web::error::ErrorBadRequest;
use actix_web::error::ErrorInternalServerError;
use actix_web::error::ErrorNotFound;
use actix_web::get;
use actix_web::http::StatusCode;
use anyhow::anyhow;
use anyhow::Error;

use crate::utils;
use crate::widgets::WidgetMetadata;
use crate::widgets::get_widget_from_rest_path;

static WIDGET_TEMPLATE: &str = include_str!("./../static/index.html.template");

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

/* ========================================================================== */

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
