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

use axum::body::Body;
use axum::extract::Path;
use axum::extract::Request;
use axum::http::StatusCode;
use axum::response::Response;

use crate::axum::utils::CACHE_REVALIDATE;
use crate::axum::utils::serve_partial_content;
use crate::utils::constants::BASE_REST_PORT;
use crate::utils::safe_guard_path;
use crate::widgets::WidgetMetadata;
use crate::widgets::get_widget_from_rest_path;

/* ========================================================================== */

static WIDGET_TEMPLATE: &str = include_str!("./../static/index.html.template");

fn fill_fieldstate(template: &str, widget: &WidgetMetadata) -> String {
    let mut template = String::from(template);

    /* ====================================================================== */

    let mut fieldstate: HashMap<String, serde_json::Value> = HashMap::new();

    let fieldstate_map = widget.fieldstate();
    for (key, value) in widget.fields().iter() {
        if !value.is_object() {
            continue;
        }

        if let Some(state_value) = fieldstate_map.get(key) {
            fieldstate.insert(key.clone(), state_value.clone());
        } else if let Some(obj) = value.as_object() {
            if let Some(default_value) = obj.get("value") {
                fieldstate.insert(key.clone(), default_value.clone());
            }
        }
    }

    /* ====================================================================== */

    for (key, value) in fieldstate.iter() {
        match serde_plain::to_string(value) {
            Ok(value_str) => {
                template = template.replace(&format!("{{{{{}}}}}", key), &value_str);
                template = template.replace(&format!("{{{}}}", key), &value_str);
            },
            Err(err) => {
                log::error!("Failed to serialize fieldstate value for key '{}': {:#?}", key, err);
                continue;
            }
        }
    }

    return template;
}

/* ========================================================================== */

pub async fn get_widget_assets(Path((widget_name, asset_path)): Path<(String, String)>, req: Request<Body>) -> Response {
    let widget_metadata: WidgetMetadata;
    match get_widget_from_rest_path(&widget_name) {
        Ok(widget) => widget_metadata = widget,
        Err(_) => {
            return Response::builder().status(StatusCode::NOT_FOUND)
                .body(Body::from(format!("Widget '{}' not found", widget_name)))
                .expect("Failed to build HTTP response");
        }
    }

    let asset_full_path: PathBuf;
    match safe_guard_path(&widget_metadata.assets_path(), &asset_path) {
        Ok(path) => asset_full_path = path,
        Err(err) => {
            log::error!("Invalid asset path '{}' for widget '{}': {:#?}", asset_path, widget_name, err);
            return Response::builder().status(StatusCode::BAD_REQUEST)
                .body(Body::from("Invalid asset path"))
                .expect("Failed to build HTTP response");
        }
    }

    if !asset_full_path.exists() {
        return Response::builder().status(StatusCode::NOT_FOUND)
            .body(Body::from(format!("Asset '{}' not found in widget '{}'", asset_path, widget_name)))
            .expect("Failed to build HTTP response");
    } else if asset_full_path.is_dir() {
        return Response::builder().status(StatusCode::BAD_REQUEST)
            .body(Body::from(format!("Asset '{}' is a directory, not a file", asset_path)))
            .expect("Failed to build HTTP response");
    }

    return serve_partial_content(&asset_full_path, req.headers(), CACHE_REVALIDATE);
}

/* ========================================================================== */

pub async fn get_widget_css(Path(widget_name): Path<String>) -> Response {
    if let Ok(widget) = get_widget_from_rest_path(&widget_name) {
        let content = fill_fieldstate(&widget.widget_css(), &widget);
        return Response::builder().status(StatusCode::OK)
            .header("Content-Type", "text/css; charset=utf-8")
            .body(Body::from(content))
            .expect("Failed to build HTTP response");
    }

    return Response::builder().status(StatusCode::NOT_FOUND)
        .header("Content-Type", "text/plain; charset=utf-8")
        .body(Body::from(format!("Widget '{}' file 'widget.css' not found", widget_name)))
        .expect("Failed to build HTTP response");
}

pub async fn get_widget_js(Path(widget_name): Path<String>) -> Response {
    if let Ok(widget) = get_widget_from_rest_path(&widget_name) {
        let content = fill_fieldstate(&widget.widget_js(), &widget);
        return Response::builder().status(StatusCode::OK)
            .header("Content-Type", "text/javascript; charset=utf-8")
            .body(Body::from(content))
            .expect("Failed to build HTTP response");
    }

    return Response::builder().status(StatusCode::NOT_FOUND)
        .header("Content-Type", "text/plain; charset=utf-8")
        .body(Body::from(format!("Widget '{}' file 'widget.js' not found", widget_name)))
        .expect("Failed to build HTTP response");
}

pub async fn get_widget(Path(widget_name): Path<String>, req: Request<Body>) -> Response {
    if let Ok(widget) = get_widget_from_rest_path(&widget_name) {
        let mut content = String::from(WIDGET_TEMPLATE);
        content = content.replace("{{WIDGET_HTML}}", &widget.widget_html());

        let uri = req.uri();
        let scheme = uri.scheme_str().unwrap_or("http");
        let host = uri.host().unwrap_or("localhost");
        let base_url = format!("{}://{}:{}/widget/{}/", scheme, host, BASE_REST_PORT, widget_name);
        content = content.replace("{{WIDGET_BASE_URL}}", &base_url);

        content = fill_fieldstate(&content, &widget);

        return Response::builder().status(StatusCode::OK)
            .header("Content-Type", "text/html; charset=utf-8")
            .body(Body::from(content))
            .expect("Failed to build HTTP response");
    }

    return Response::builder().status(StatusCode::NOT_FOUND)
        .header("Content-Type", "text/plain; charset=utf-8")
        .body(Body::from(format!("Widget '{}' entrypoint not found", widget_name)))
        .expect("Failed to build HTTP response");
}
