/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::sync::LazyLock;
use std::time::Duration;

use axum::body::Body;
use axum::extract::Path;
use axum::extract::Query;
use axum::extract::Request;
use axum::http::StatusCode;
use axum::response::Response;

use crate::utils::base64;

#[cfg(target_os = "windows")]
static USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0";

#[cfg(target_os = "linux")]
static USER_AGENT: &str = "Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0";

#[cfg(target_os = "macos")]
static USER_AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:150.0) Gecko/20100101 Firefox/150.0";

static REQWEST_CLIENT: LazyLock<reqwest::Client> = LazyLock::new(|| {
    let client_builder = reqwest::Client::builder()
        .user_agent(USER_AGENT)
        .redirect(reqwest::redirect::Policy::none())
        .timeout(Duration::from_secs(30));

    return client_builder.build().unwrap();
});

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

    let mut request = REQWEST_CLIENT.get(&normalized_url);

    if let Some(referer) = &query.referer {
        request = request.header("Referer", referer);
    }

    if let Some(range) = req.headers().get("Range") {
        request = request.header("Range", range);
    }

    match request.send().await {
        Ok(response) => {
            let status = StatusCode::from_u16(response.status().as_u16()).unwrap_or(StatusCode::OK);

            let mut builder = Response::builder().status(status);
            for key in &["Content-Type", "Content-Range", "Accept-Ranges", "Content-Length"] {
                if let Some(val) = response.headers().get(*key) {
                    builder = builder.header(*key, val);
                }
            }

            let stream = response.bytes_stream();
            let body = Body::from_stream(stream);

            return builder.body(body).unwrap();
        }
        Err(err) => {
            return Response::builder().status(502)
                .body(format!("Failed to fetch '{}': {:?}", normalized_url, err).into())
                .unwrap();
        }
    }
}
