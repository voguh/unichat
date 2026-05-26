/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use actix_web::error::ErrorBadRequest;
use actix_web::error::ErrorInternalServerError;
use actix_web::error::ErrorNotFound;
use actix_web::get;
use actix_web::http::StatusCode;
use actix_web::HttpResponse;
use actix_web::Responder;
use actix_web::web::Path;
use actix_web::web::Query;

use crate::utils::base64;
use crate::utils::ureq;

#[cfg(target_os = "windows")]
static USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0";

#[cfg(target_os = "linux")]
static USER_AGENT: &str = "Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0";

#[cfg(target_os = "macos")]
static USER_AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:150.0) Gecko/20100101 Firefox/150.0";

#[derive(serde::Deserialize)]
struct QueryString {
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

#[get("/proxy/{path:.*}")]
pub async fn proxy(path: Path<String>, query: Query<QueryString>) -> Result<impl Responder, actix_web::Error> {
    let encoded_url: String = path.into_inner();
    if encoded_url.trim().is_empty() {
        return Err(ErrorBadRequest("URL path cannot be empty"));
    }

    let url_path = base64::url_safe_decode(encoded_url).map_err(|e| ErrorBadRequest(format!("Failed to decode URL path: {:?}", e)))?;
    let url_path = String::from_utf8(url_path).map_err(|e| ErrorBadRequest(format!("Decoded URL path is not valid UTF-8: {:?}", e)))?;
    let normalized_url = normalize_url(&url_path);
    if normalized_url.trim() == "https://" {
        return Err(ErrorBadRequest("Decoded URL path cannot be empty"));
    }

    let mut result = ureq::get(&normalized_url).header("User-Agent", USER_AGENT);
    if let Some(referer) = &query.referer {
        result = result.header("Referer", referer);
    }

    match result.call() {
        Ok(response) => {
            let status = StatusCode::from_u16(response.status().as_u16()).unwrap_or(StatusCode::OK);
            let content_type = response.headers().get("content-type").and_then(|v| v.to_str().ok()).unwrap_or("application/octet-stream").to_string();
            let body = response.into_body().read_to_vec().map_err(|e| ErrorInternalServerError(format!("Failed to read response body: {:?}", e)))?;

            return Ok(HttpResponse::build(status).content_type(content_type).body(body));
        },
        Err(err) => {
            log::error!("Failed to fetch URL '{}': {:?}", url_path, err);
            return Err(ErrorNotFound(format!("Failed to fetch URL '{}'", url_path)));
        }
    }
}
