/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use std::fs;

use actix_web::get;
use actix_web::http::header;
use actix_web::http::StatusCode;
use actix_web::web;
use actix_web::HttpRequest;
use actix_web::HttpResponse;
use actix_web::Responder;
use serde::Deserialize;

use crate::events;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatLoadEventPayload;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UNICHAT_EVENT_LOAD_TYPE;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::properties::PropertiesKey;

#[derive(Deserialize)]
struct WidgetsPathParams {
    name: String
}

static WIDGET_TEMPLATE: &str = include_str!("./static/index.html.template");

#[get("/widget/{name}")]
pub async fn widget(info: web::Path<WidgetsPathParams>) -> impl Responder {
    let widget_defaults_dir = properties::get_app_path(AppPaths::UniChatWidgetDefaults);
    let widgets_dir = properties::get_app_path(AppPaths::UniChatWidgets);
    let mut  widget = widget_defaults_dir.join(&info.name);
    if !widget.exists() || !widget.is_dir() {
        widget = widgets_dir.join(&info.name);
    }

    if !widget.exists() || !widget.is_dir() {
        return HttpResponse::build(StatusCode::NOT_FOUND)
            .insert_header((header::CONTENT_TYPE, "text/plain"))
            .body(format!("Widget '{}' not found", info.name));
    }

    let css = fs::read_to_string(widget.join("style.css")).unwrap_or_default();
    let js = fs::read_to_string(widget.join("script.js")).unwrap_or_default();
    let html = fs::read_to_string(widget.join("main.html")).unwrap_or_default();

    let content = WIDGET_TEMPLATE
        .replace("{{WIDGET_STYLE}}", &css)
        .replace("{{WIDGET_SCRIPT}}", &js)
        .replace("{{WIDGET_HTML}}", &html);

    return HttpResponse::build(StatusCode::OK).insert_header((header::CONTENT_TYPE, "text/html")).body(content);
}

#[get("/ws")]
async fn ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, actix_web::Error> {
    let (res, mut session, _stream) = actix_ws::handle(&req, stream)?;

    actix_web::rt::spawn(async move {
        if let Err(err) = session.ping(b"ping").await {
            log::error!("Failed to send ping to WebSocket: {}", err);
            return;
        }

        if let Ok(channel_id) = properties::get_item(PropertiesKey::YouTubeChannelId) {
            let load_event = UniChatEvent::Load {
                event_type: String::from(UNICHAT_EVENT_LOAD_TYPE),
                data: UniChatLoadEventPayload {
                    channel_id: channel_id.clone(),
                    channel_name: None,
                    platform: UniChatPlatform::YouTube
                }
            };

            if let Ok(parsed) = serde_json::to_string(&load_event) {
                if let Err(err) = session.text(parsed).await {
                    log::error!("Failed to send load event to WebSocket: {}", err);
                }
            } else {
                log::error!("Failed to serialize load event");
            }
        } else {
            log::warn!("YouTube channel ID not set, skipping initial load event");
        }

        /* ====================================================================================== */

        let mut rx = events::event_emitter().subscribe();

        loop {
            let received = rx.recv().await;

            match received {
                Ok(event) => {
                    if let Ok(parsed) = serde_json::to_string(&event) {
                        if let Err(err) = session.text(parsed).await {
                            log::error!("Failed to send event to WebSocket: {}", err);
                            break;
                        }
                    } else {
                        log::error!("Failed to serialize event");
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped)) => {
                    log::warn!("WebSocket receiver lagged, skipped {} messages", skipped);
                }
                Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                    log::info!("WebSocket receiver closed, exiting loop");
                    break;
                }
            }
        }

        let _ = session.close(None).await;
        drop(rx);
        log::info!("WebSocket session closed");
    });

    return Ok(res);
}
