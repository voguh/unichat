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
use actix_web::http::header;

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
        let content_type = kind.mime_type();
        let content_len = content.len() as u64;

        if let Some(range_value) = req.headers().get(header::RANGE) {
            let range_value = range_value.to_str().map_err(|e| {
                log::error!("{:?}", e);
                return ErrorBadRequest(format!("Invalid Range header for gallery item '{}'", asset_name));
            })?;

            if let Some(range_spec) = range_value.strip_prefix("bytes=") {
                if let Some((start_str, end_str)) = range_spec.split_once('-') {
                    let start;
                    if start_str.trim().is_empty() {
                        let suffix_len = end_str.trim().parse::<u64>().map_err(|e| {
                            log::error!("{:?}", e);
                            return ErrorBadRequest(format!("Invalid suffix range for gallery item '{}'", asset_name));
                        })?;

                        if suffix_len >= content_len {
                            start = 0;
                        } else {
                            start = content_len - suffix_len;
                        }
                    } else {
                        start = start_str.trim().parse::<u64>().map_err(|e| {
                            log::error!("{:?}", e);
                            return ErrorBadRequest(format!("Invalid range start for gallery item '{}'", asset_name));
                        })?;
                    };

                    if start >= content_len {
                        return Ok(HttpResponse::build(StatusCode::RANGE_NOT_SATISFIABLE)
                            .insert_header((header::ACCEPT_RANGES, "bytes"))
                            .insert_header((header::CONTENT_RANGE, format!("bytes */{}", content_len)))
                            .finish());
                    }

                    let mut end;
                    if end_str.trim().is_empty() {
                        end = content_len - 1;
                    } else {
                        end = end_str.trim().parse::<u64>().map_err(|e| {
                            log::error!("{:?}", e);
                            return ErrorBadRequest(format!("Invalid range end for gallery item '{}'", asset_name));
                        })?;
                    }
                    end = end.min(content_len - 1);

                    if end < start {
                        return Ok(HttpResponse::build(StatusCode::RANGE_NOT_SATISFIABLE)
                            .insert_header((header::ACCEPT_RANGES, "bytes"))
                            .insert_header((header::CONTENT_RANGE, format!("bytes */{}", content_len)))
                            .finish());
                    }

                    let body = content[start as usize..=end as usize].to_vec();
                    return Ok(HttpResponse::build(StatusCode::PARTIAL_CONTENT)
                        .insert_header((header::ACCEPT_RANGES, "bytes"))
                        .insert_header((header::CONTENT_RANGE, format!("bytes {}-{}/{}", start, end, content_len)))
                        .insert_header((header::CONTENT_LENGTH, body.len().to_string()))
                        .content_type(content_type)
                        .body(body));
                }
            }
        }

        return Ok(HttpResponse::build(StatusCode::OK)
            .insert_header((header::ACCEPT_RANGES, "bytes"))
            .content_type(content_type)
            .body(content))
    } else {
        return Err(ErrorBadRequest(format!("Could not infer MIME type for gallery item '{}'", asset_name)));
    }
}
