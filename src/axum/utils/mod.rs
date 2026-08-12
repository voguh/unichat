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
use std::path::Path;
use std::time::UNIX_EPOCH;

use axum::body::Body;
use axum::http::HeaderMap;
use axum::response::Response;

pub const CACHE_REVALIDATE: &str = "no-cache";
pub const CACHE_IMMUTABLE: &str = "max-age=86400";

fn build_etag(path: &Path) -> Option<String> {
    let metadata = fs::metadata(path).ok()?;
    let modified_at = metadata.modified().ok()?.duration_since(UNIX_EPOCH).ok()?;

    return Some(format!("W/\"{}-{}\"", modified_at.as_secs(), metadata.len()));
}

fn split_range(range: &str) -> (Option<usize>, Option<usize>) {
    let parts: Vec<&str> = range.split('-').collect();
    if parts.len() != 2 {
        return (None, None);
    }

    let start = parts[0].parse::<usize>().ok();
    let end = parts[1].parse::<usize>().ok();

    return (start, end);
}

pub fn serve_partial_content(path: &Path, headers: &HeaderMap, cache_control: &str) -> Response {
    let etag = build_etag(path);
    if let Some(etag) = &etag {
        let requested = headers.get("If-None-Match").and_then(|value| value.to_str().ok());
        if requested == Some(etag.as_str()) {
            return Response::builder().status(304)
                .header("ETag", etag)
                .header("Cache-Control", cache_control)
                .body(Body::empty())
                .unwrap();
        }
    }

    let range = headers.get("Range").and_then(|value| value.to_str().ok());

    let content: Vec<u8>;
    match fs::read(path) {
        Ok(c) => content = c,
        Err(e) => {
            log::error!("Failed to read file '{}': {:#?}", path.display(), e);
            return Response::builder().status(500)
                .body("Failed to read file".into())
                .unwrap();
        }
    }

    let content_len = content.len();
    let content_type = infer::get(&content).map(|kind| kind.mime_type()).unwrap_or("application/octet-stream");

    if let Some(range_value) = range.and_then(|r| r.strip_prefix("bytes=")) {
        let (start, end) = split_range(range_value);

        if let Some(start) = start {
            if start >= content_len {
                return Response::builder().status(416)
                    .header("Content-Range", format!("bytes */{}", content_len))
                    .body("Requested range not satisfiable".into())
                    .unwrap();
            }
        }

        if let Some(end) = end {
            if end >= content_len {
                return Response::builder().status(416)
                    .header("Content-Range", format!("bytes */{}", content_len))
                    .body("Requested range not satisfiable".into())
                    .unwrap();
            }
        }

        let mut response_range: Option<String> = None;
        let mut partial_content: Option<Vec<u8>> = None;
        match (start, end) {
            (Some(start), Some(end)) => {
                if end < start {
                    return Response::builder().status(416)
                        .header("Content-Range", format!("bytes */{}", content_len))
                        .body("Requested range not satisfiable".into())
                        .unwrap();
                }

                partial_content = Some(content[start..=end].to_vec());
                response_range = Some(format!("bytes {}-{}/{}", start, end, content_len));
            }
            (Some(start), None) => {
                partial_content = Some(content[start..].to_vec());
                response_range = Some(format!("bytes {}-{}/{}", start, content_len - 1, content_len));
            }
            (None, Some(suffix_len)) => {
                let start = content_len.saturating_sub(suffix_len);
                partial_content = Some(content[start..].to_vec());
                response_range = Some(format!("bytes {}-{}/{}", start, content_len - 1, content_len));
            }
            (None, None) => {}
        }

        if let Some(partial_content) = partial_content {
            return Response::builder().status(206)
                .header("Content-Range", response_range.unwrap())
                .header("Content-Length", partial_content.len().to_string())
                .header("Content-Type", content_type)
                .header("Cache-Control", cache_control)
                .header("ETag", etag.unwrap_or_default())
                .body(partial_content.into())
                .unwrap();
        }
    }

    return Response::builder().status(200)
            .header("Content-Type", content_type)
            .header("Content-Length", content_len.to_string())
            .header("Cache-Control", cache_control)
            .header("ETag", etag.unwrap_or_default())
            .body(content.into())
            .unwrap();
}
