/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

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

use crate::plugins;
use crate::utils;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

fn safe_guard_path(base_path: &PathBuf, concat_str: &str) -> Result<PathBuf, actix_web::Error> {
    return utils::safe_guard_path(base_path, concat_str).map_err(|e| {
        log::error!("{:#?}", e);
        return ErrorInternalServerError("Failed to resolve asset path safely");
    });
}

/* ========================================================================== */

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
