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
use crate::utils::properties;
use crate::utils::properties::AppPaths;

#[derive(Deserialize)]
struct WidgetsPathParams {
    name: String
}

static WIDGET_TEMPLATE: &str = include_str!("./static/index.html.template");

#[get("/widget/{name}")]
pub async fn widget(info: web::Path<WidgetsPathParams>) -> impl Responder {
    let widgets_dir = properties::get_app_path(AppPaths::UniChatWidgetsDir);
    let widget = widgets_dir.join(&info.name);
    if !widget.exists() {
        return HttpResponse::build(StatusCode::NOT_FOUND)
            .insert_header((header::CONTENT_TYPE, "text/plain"))
            .body(format!("Widget '{}' not found", info.name));
    }

    let css = fs::read_to_string(widget.join("style.css")).unwrap_or(String::new());
    let js = fs::read_to_string(widget.join("script.js")).unwrap_or(String::new());
    let html = fs::read_to_string(widget.join("main.html")).unwrap_or(String::new());

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
        let mut rx = events::event_emitter().subscribe();

        while let Ok(received) = rx.recv().await {
            let parsed = serde_json::to_string(&received).unwrap();
            if let Err(err) = session.text(parsed).await {
                println!("An error occurred on send message to client, exiting loop: {err}");
                break;
            }
        }

        let _ = session.close(None).await;
        drop(rx);
        println!("Client disconnected");
    });

    return Ok(res);
}
