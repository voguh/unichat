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
use axum::response::Response;

use crate::axum::utils::CACHE_IMMUTABLE;
use crate::axum::utils::CACHE_REVALIDATE;
use crate::axum::utils::serve_file;
use crate::plugins;
use crate::utils::paths;
use crate::utils::paths::AppPaths;

/* ========================================================================== */

pub async fn assets(Path(mut asset_path): Path<String>, req: Request<Body>) -> Response {
    let mut asset_path_parts = asset_path.split("/");
    let first_part = asset_path_parts.next().unwrap_or("");

    let asset_base_path: PathBuf;
    let cache_control: &str;
    let plugins = plugins::get_plugins();
    if let Some(plugin) = plugins.iter().find(|p| p.id == first_part) {
        asset_base_path = plugin.get_assets_path();
        let remaining_parts: Vec<&str> = asset_path_parts.collect();
        asset_path = remaining_parts.join("/");
        cache_control = CACHE_REVALIDATE;
    } else {
        asset_base_path = paths::get(AppPaths::UniChatAssets);
        cache_control = CACHE_IMMUTABLE;
    }

    return serve_file(&asset_base_path, &asset_path, req.headers(), cache_control);
}
