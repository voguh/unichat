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
use axum::http::Request;
use axum::http::StatusCode;
use axum::response::Response;

/* ========================================================================== */

pub async fn not_found(req: Request<Body>) -> Response {
    return Response::builder().status(StatusCode::NOT_FOUND)
        .body(Body::from(format!("Request '{}' not found", req.uri())))
        .unwrap();
}
