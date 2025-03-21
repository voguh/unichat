use actix_web::{get, web, HttpRequest, HttpResponse};

use crate::events;

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
