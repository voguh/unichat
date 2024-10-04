use actix_web::{get, HttpResponse, Responder};
use serde::Serialize;

#[derive(Serialize)]
struct JsonResponse {
    message: String
}

#[get("/events")]
async fn events_stream() -> impl Responder {
    HttpResponse::NotImplemented().json(JsonResponse { message: String::from("Method not implemented yet!") })
}
