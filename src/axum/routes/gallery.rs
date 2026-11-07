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
use axum::extract::Request;
use axum::response::Response;

use crate::axum::utils::CACHE_REVALIDATE;
use crate::axum::utils::serve_file;
use crate::utils::paths;
use crate::utils::paths::AppPaths;

/* ========================================================================== */

pub async fn gallery(Path(asset_path): Path<String>, req: Request<Body>) -> Response {
    let gallery_path = paths::get(AppPaths::UniChatGallery);
    return serve_file(&gallery_path, &asset_path, req.headers(), CACHE_REVALIDATE);
}
