use actix_web::{get, web, Error, HttpRequest, HttpResponse};
use tokio::sync::broadcast;

use crate::events;

#[get("/ws")]
async fn ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let (res, mut session, _stream) = actix_ws::handle(&req, stream)?;

    let mut rx = events::INSTANCE.lock().unwrap().tx.subscribe();
    tokio::spawn(async move {
        loop {
            match rx.recv().await {
                Ok(received) => {
                    if let Err(err) = session.text(serde_json::to_string(&received).unwrap()).await {
                        println!("An error occurred on send message to client, exiting loop: {err}");
                        break;
                    }
                }

                Err(broadcast::error::RecvError::Closed) => {
                    println!("Transmitter disconnected, exiting loop");
                    break;
                }

                Err(broadcast::error::RecvError::Lagged(_)) => {
                    println!("Receiver lagged behind, skipping messages");
                }
            }
        };
    });

    Ok(res)
}
