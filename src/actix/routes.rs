use std::sync::{mpsc, Arc};
use std::time::Duration;

use actix_web::{get, rt, web, Error, HttpRequest, HttpResponse};

use crate::events;

#[get("/ws")]
async fn ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let (res, mut session, _stream) = actix_ws::handle(&req, stream)?;

    let rx = Arc::clone(&events::INSTANCE.lock().unwrap().rx);
    rt::spawn(async move {

        loop {
            match rx.lock() {
                Ok(rx) => {
                    match rx.try_recv() {
                        Ok(received) => {
                            if let Err(err) = session.text(serde_json::to_string(&received).unwrap()).await {
                                println!("An error occurred on send message to client, exiting loop: {err}");
                                break;
                            }
                        }

                        Err(mpsc::TryRecvError::Empty) => {
                            rt::time::sleep(Duration::from_millis(100)).await;
                        }

                        Err(mpsc::TryRecvError::Disconnected) => {
                            println!("Transmitter disconnected, exiting loop");
                            break;
                        }
                    }
                }
                Err(err) => {
                    println!("Failed to acquire lock, exiting loop: {err}");
                    break;
                }
            }
        };
    });

    Ok(res)
}
