/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use axum::body::Body;
use axum::extract::Path;
use axum::http::StatusCode;
use axum::response::Response;

use crate::axum::utils::CACHE_IMMUTABLE;
use crate::get_app_handle;

/* ========================================================================== */

pub async fn fontawesome(Path(asset_path): Path<String>) -> Response {
    let app = get_app_handle();
    let asset_resolver = app.asset_resolver();

    if let Some(asset) = asset_resolver.get(format!("fontawesome/{}", asset_path)) {
        return Response::builder()
            .status(StatusCode::OK)
            .header("Content-Type", asset.mime_type())
            .header("Cache-Control", CACHE_IMMUTABLE)
            .body(Body::from(asset.bytes().to_vec()))
            .expect("Failed to build HTTP response");
    }

    return Response::builder()
        .status(StatusCode::NOT_FOUND)
        .body(Body::from(format!("Asset '{}' not found in fontawesome", asset_path)))
        .expect("Failed to build HTTP response");
}
