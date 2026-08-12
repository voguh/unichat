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
use axum::extract::Query;
use axum::extract::Request;
use axum::http::StatusCode;
use axum::response::Response;

use crate::utils::base64;
use crate::utils::ureq;

const FORWARDED_HEADERS: [&str; 10] = [
    "Content-Type", "Content-Range", "Accept-Ranges", "Content-Length",
    "Cache-Control", "ETag", "Last-Modified", "Expires", "Age", "Vary"
];

#[derive(serde::Deserialize)]
pub struct QueryString {
    referer: Option<String>
}

fn normalize_url(url: &str) -> String {
    if url.starts_with("//") {
        return format!("https:{}", url);
    }

    if url.starts_with("http://") {
        return url.replacen("http://", "https://", 1);
    }

    if !url.starts_with("https://") {
        return format!("https://{}", url);
    }

    return String::from(url);
}

pub async fn proxy(Path(encoded_url): Path<String>, Query(query): Query<QueryString>, req: Request<Body>) -> Response {
    if encoded_url.trim().is_empty() {
        return Response::builder().status(400)
            .body("Encoded URL path cannot be empty".into())
            .unwrap();
    }

    let url_path: String;
    match base64::url_safe_decode(encoded_url) {
        Ok(decoded) => url_path = String::from_utf8_lossy(&decoded).to_string(),
        Err(e) => {
            log::error!("Failed to decode URL path: {:?}", e);
            return Response::builder().status(400)
                .body(format!("Failed to decode URL path: {:?}", e).into())
                .unwrap();
        }
    }

    let normalized_url = normalize_url(&url_path);
    if normalized_url.trim() == "https://" {
        return Response::builder().status(400)
            .body("Decoded URL cannot be empty".into())
            .unwrap();
    }

    let referer = query.referer.clone();
    let range = req.headers().get("Range").and_then(|value| value.to_str().ok()).map(|value| value.to_string());

    let fetched = tauri::async_runtime::spawn_blocking(move || {
        let mut request = ureq::get(&normalized_url).config().max_redirects(0).build();

        if let Some(referer) = referer {
            request = request.header("Referer", &referer);
        }

        if let Some(range) = range {
            request = request.header("Range", &range);
        }

        let mut response = request.call()?;
        let body = response.body_mut().read_to_vec()?;

        return Ok::<(ureq::http::response::Parts, Vec<u8>), ureq::Error>((response.into_parts().0, body));
    }).await;

    match fetched {
        Ok(Ok((parts, body))) => {
            let status = StatusCode::from_u16(parts.status.as_u16()).unwrap_or(StatusCode::OK);

            let mut builder = Response::builder().status(status);
            for key in FORWARDED_HEADERS.iter() {
                if let Some(val) = parts.headers.get(*key) {
                    builder = builder.header(*key, val);
                }
            }

            return builder.body(Body::from(body)).unwrap();
        }
        Ok(Err(err)) => {
            return Response::builder().status(502)
                .body(format!("Failed to fetch proxied url: {:?}", err).into())
                .unwrap();
        }
        Err(err) => {
            return Response::builder().status(500)
                .body(format!("Proxy task failed: {:?}", err).into())
                .unwrap();
        }
    }
}
