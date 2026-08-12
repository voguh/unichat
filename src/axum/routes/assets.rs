/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::path::PathBuf;

use axum::body::Body;
use axum::extract::Path;
use axum::extract::Request;
use axum::http::StatusCode;
use axum::response::Response;

use crate::axum::utils::CACHE_IMMUTABLE;
use crate::axum::utils::CACHE_REVALIDATE;
use crate::axum::utils::serve_partial_content;
use crate::plugins;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::safe_guard_path;

pub async fn assets(Path(mut asset_path): Path<String>, req: Request<Body>) -> Response {
    let mut asset_path_parts = asset_path.split("/");
    let first_part = asset_path_parts.next().unwrap_or("");

    let asset_base_path: PathBuf;
    let cache_control: &str;
    let plugins = plugins::get_plugins().unwrap_or_default();
    if let Some(plugin) = plugins.iter().find(|p| p.name == first_part) {
        asset_base_path = plugin.get_assets_path();
        asset_path = asset_path_parts.collect::<Vec<&str>>().join("/");
        cache_control = CACHE_REVALIDATE;
    } else {
        asset_base_path = properties::get_app_path(AppPaths::UniChatAssets);
        cache_control = CACHE_IMMUTABLE;
    }

    let asset_full_path: PathBuf;
    match safe_guard_path(&asset_base_path, &asset_path) {
        Ok(path) => asset_full_path = path,
        Err(err) => {
            log::error!("Invalid asset path '{}' for assets: {:#?}", asset_path, err);
            return Response::builder().status(StatusCode::BAD_REQUEST)
                .body(Body::from("Invalid asset path"))
                .unwrap();
        }
    }

    if !asset_full_path.exists() {
        return Response::builder().status(StatusCode::NOT_FOUND)
            .body(Body::from(format!("Asset '{}' not found in gallery", asset_path)))
            .unwrap();
    } else if asset_full_path.is_dir() {
        return Response::builder().status(StatusCode::BAD_REQUEST)
            .body(Body::from(format!("Asset '{}' is a directory, not a file", asset_path)))
            .unwrap();
    }

    return serve_partial_content(&asset_full_path, req.headers(), cache_control);
}
