/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs::File;
use std::fs::Metadata;
use std::io::Read;
use std::io::Seek;
use std::io::SeekFrom;
use std::path::Path;
use std::time::UNIX_EPOCH;

use axum::body::Body;
use axum::http::HeaderMap;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::response::Response;

use crate::utils::safe_guard_path;

/* ========================================================================== */

pub const CACHE_REVALIDATE: &str = "no-cache";
pub const CACHE_IMMUTABLE: &str = "max-age=86400";

const CONTENT_SNIFF_LENGTH: u64 = 8192;

/* ========================================================================== */

enum ByteRange {
    Full,
    Partial(u64, u64),
    Unsatisfiable
}

fn resolve_range(range: Option<&str>, length: u64) -> ByteRange {
    let spec = range.and_then(|value| value.strip_prefix("bytes="));
    if let Some((start, end)) = spec.and_then(|spec| spec.split_once('-')) {
        if length == 0 {
            return ByteRange::Unsatisfiable;
        }

        let start: Option<u64> = start.trim().parse().ok();
        let end: Option<u64> = end.trim().parse().ok();

        return match (start, end) {
            (Some(start), Some(end)) if start >= length || end < start => ByteRange::Unsatisfiable,
            (Some(start), Some(end)) => ByteRange::Partial(start, end.min(length - 1)),
            (Some(start), None) if start >= length => ByteRange::Unsatisfiable,
            (Some(start), None) => ByteRange::Partial(start, length - 1),
            (None, Some(0)) => ByteRange::Unsatisfiable,
            (None, Some(suffix)) => ByteRange::Partial(length.saturating_sub(suffix), length - 1),
            (None, None) => ByteRange::Full
        };
    }

    return ByteRange::Full;
}

fn build_etag(metadata: &Metadata) -> Option<String> {
    let modified_at = metadata.modified().ok()?.duration_since(UNIX_EPOCH).ok()?;
    return Some(format!("W/\"{}-{}\"", modified_at.as_secs(), metadata.len()));
}

fn read_chunk(file: &mut File, offset: u64, length: u64) -> Result<Vec<u8>, std::io::Error> {
    let mut chunk = vec![0; length as usize];
    file.seek(SeekFrom::Start(offset))?;
    file.read_exact(&mut chunk)?;

    return Ok(chunk);
}

fn read_error(path: &Path, err: std::io::Error) -> Response {
    log::error!("Failed to read file '{}': {:#?}", path.display(), err);
    return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to read file").into_response();
}

fn serve_partial_content(path: &Path, headers: &HeaderMap, cache_control: &str) -> Response {
    let mut file: File;
    match File::open(path) {
        Ok(opened) => file = opened,
        Err(err) => {
            return read_error(path, err);
        }
    }

    let metadata: Metadata;
    match file.metadata() {
        Ok(file_metadata) => metadata = file_metadata,
        Err(err) => {
            return read_error(path, err);
        }
    }

    let length = metadata.len();
    let etag = build_etag(&metadata);
    let requested_etag = headers.get("If-None-Match").and_then(|value| value.to_str().ok());
    if etag.is_some() && requested_etag == etag.as_deref() {
        return Response::builder()
            .status(StatusCode::NOT_MODIFIED)
            .header("ETag", etag.unwrap_or_default())
            .header("Cache-Control", cache_control)
            .body(Body::empty())
            .expect("Failed to build HTTP response");
    }

    let head: Vec<u8>;
    match read_chunk(&mut file, 0, length.min(CONTENT_SNIFF_LENGTH)) {
        Ok(chunk) => head = chunk,
        Err(err) => {
            return read_error(path, err);
        }
    }

    let content_type = infer::get(&head).map(|kind| kind.mime_type()).unwrap_or("application/octet-stream");

    let offset: u64;
    let chunk_length: u64;
    let mut content_range: Option<String> = None;
    let range = headers.get("Range").and_then(|value| value.to_str().ok());
    match resolve_range(range, length) {
        ByteRange::Full => {
            offset = 0;
            chunk_length = length;
        }
        ByteRange::Partial(start, end) => {
            offset = start;
            chunk_length = end - start + 1;
            content_range = Some(format!("bytes {}-{}/{}", start, end, length));
        }
        ByteRange::Unsatisfiable => {
            return Response::builder()
                .status(StatusCode::RANGE_NOT_SATISFIABLE)
                .header("Content-Range", format!("bytes */{}", length))
                .body(Body::from("Requested range not satisfiable"))
                .expect("Failed to build HTTP response");
        }
    }

    let content: Vec<u8>;
    match read_chunk(&mut file, offset, chunk_length) {
        Ok(chunk) => content = chunk,
        Err(err) => {
            return read_error(path, err);
        }
    }

    let mut builder = Response::builder()
        .header("Content-Type", content_type)
        .header("Content-Length", content.len().to_string())
        .header("Cache-Control", cache_control);

    if let Some(etag) = etag {
        builder = builder.header("ETag", etag);
    }

    if let Some(content_range) = content_range {
        builder = builder.status(StatusCode::PARTIAL_CONTENT).header("Content-Range", content_range);
    } else {
        builder = builder.status(StatusCode::OK);
    }

    return builder.body(Body::from(content)).expect("Failed to build HTTP response");
}

/* ========================================================================== */

pub fn serve_file(base_path: &Path, relative_path: &str, headers: &HeaderMap, cache_control: &str) -> Response {
    let full_path;
    match safe_guard_path(base_path, relative_path) {
        Ok(path) => full_path = path,
        Err(err) => {
            log::error!("Invalid asset path '{}' in {:?}: {:#?}", relative_path, base_path, err);
            return (StatusCode::BAD_REQUEST, "Invalid asset path").into_response();
        }
    }

    if !full_path.exists() {
        return (StatusCode::NOT_FOUND, format!("Asset '{}' not found", relative_path)).into_response();
    } else if full_path.is_dir() {
        let message = format!("Asset '{}' is a directory, not a file", relative_path);
        return (StatusCode::BAD_REQUEST, message).into_response();
    }

    return serve_partial_content(&full_path, headers, cache_control);
}
