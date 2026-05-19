/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::io::Read as _;

use actix_web::HttpRequest;
use actix_web::HttpResponse;
use actix_web::Responder;
use actix_web::error::ErrorBadRequest;
use actix_web::error::ErrorNotFound;
use actix_web::get;
use actix_web::http::StatusCode;

use crate::utils::ureq;

#[cfg(target_os = "windows")]
static USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0";

#[cfg(target_os = "linux")]
static USER_AGENT: &str = "Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0";

#[cfg(target_os = "macos")]
static USER_AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:150.0) Gecko/20100101 Firefox/150.0";

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
