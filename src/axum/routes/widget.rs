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
use std::path::PathBuf;

use anyhow::anyhow;
use anyhow::Error;
use axum::body::Body;
use axum::extract::Path;
use axum::extract::Request;
use axum::http::StatusCode;
use axum::response::Response;

use crate::axum::utils::serve_partial_content;
use crate::utils::constants::BASE_REST_PORT;
use crate::utils::safe_guard_path;
use crate::widgets::WidgetMetadata;
use crate::widgets::get_widget_from_rest_path;

static WIDGET_TEMPLATE: &str = include_str!("./../static/index.html.template");

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

pub async fn get_widget_assets(Path((widget_name, asset_path)): Path<(String, String)>, req: Request<Body>) -> Response {
    let range = req.headers().get("Range").and_then(|r| r.to_str().ok());

    let widget_metadata: WidgetMetadata;
    match get_widget_from_rest_path(&widget_name) {
        Ok(widget) => widget_metadata = widget,
        Err(_) => {
            return Response::builder().status(StatusCode::NOT_FOUND)
                .body(Body::from(format!("Widget '{}' not found", widget_name)))
                .unwrap();
        }
    }

    let asset_full_path: PathBuf;
    match safe_guard_path(&widget_metadata.assets_path(), &asset_path) {
        Ok(path) => asset_full_path = path,
        Err(err) => {
            log::error!("Invalid asset path '{}' for widget '{}': {:#?}", asset_path, widget_name, err);
            return Response::builder().status(StatusCode::BAD_REQUEST)
                .body(Body::from("Invalid asset path"))
                .unwrap();
        }
    }

    if !asset_full_path.exists() {
        return Response::builder().status(StatusCode::NOT_FOUND)
            .body(Body::from(format!("Asset '{}' not found in widget '{}'", asset_path, widget_name)))
            .unwrap();
    } else if asset_full_path.is_dir() {
        return Response::builder().status(StatusCode::BAD_REQUEST)
            .body(Body::from(format!("Asset '{}' is a directory, not a file", asset_path)))
            .unwrap();
    }

    return serve_partial_content(&asset_full_path, range);
}

/* ================================================================================================================== */

pub async fn get_widget(Path(widget_name): Path<String>, req: Request<Body>) -> Response {
    let widget_metadata: WidgetMetadata;
    match get_widget_from_rest_path(&widget_name) {
        Ok(widget) => widget_metadata = widget,
        Err(_) => {
            return Response::builder().status(StatusCode::NOT_FOUND)
                .body(Body::from(format!("Widget '{}' not found", widget_name)))
                .unwrap();
        }
    }

    let css = widget_metadata.widget_css();
    let html = widget_metadata.widget_html();
    let js = widget_metadata.widget_js();

    let mut content = String::from(WIDGET_TEMPLATE);
    content = content.replace("{{WIDGET_STYLE}}", &css);
    content = content.replace("{{WIDGET_HTML}}", &html);
    content = content.replace("{{WIDGET_SCRIPT}}", &js);

    let uri = req.uri();
    let scheme = uri.scheme_str().unwrap_or("http");
    let host = uri.host().unwrap_or("localhost");
    let base_url = format!("{}://{}:{}/widget/{}/", scheme, host, BASE_REST_PORT, widget_name);
    content = content.replace("{{WIDGET_BASE_URL}}", &base_url);

    let fieldstate = load_fieldstate(&widget_metadata).unwrap_or_default();
    for (key, value) in fieldstate.iter() {
        match serde_plain::to_string(value) {
            Ok(value_str) => {
                content = content.replace(&format!("{{{{{}}}}}", key), &value_str);
                content = content.replace(&format!("{{{}}}", key), &value_str);
            },
            Err(err) => {
                log::error!("Failed to serialize fieldstate value for key '{}': {:#?}", key, err);
                continue;
            }
        }
    }

    return Response::builder().status(StatusCode::OK)
        .header("Content-Type", "text/html; charset=utf-8")
        .body(Body::from(content))
        .unwrap();
}
