use actix_web::{get, rt, web, Error, HttpRequest, HttpResponse};
use actix_ws::AggregatedMessage;
use bytestring::ByteString;
use futures_util::StreamExt;

use crate::events;

#[get("/ws")]
async fn ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let (res, session, stream) = actix_ws::handle(&req, stream)?;
    let mut emitter = events::INSTANCE.lock().unwrap();

    let mut stream = stream.aggregate_continuations().max_continuation_size(2_usize.pow(20));

    let uid = emitter.on("unichat:event", move |payload: &str| {
        let mut session_clone = session.clone();
        let data = ByteString::from(payload);

        tokio::spawn(async move {
            if let Err(err) = session_clone.text(data).await {
                eprintln!("Falha ao enviar o evento: {}", err);
            }
        });
    });

    rt::spawn(async move {

        while let Some(msg) = stream.next().await {
            match msg {
                Ok(AggregatedMessage::Close(_reason)) => {
                    emitter.off("unichat:event", uid);
                }

                _ => {}
            }
        }
    });

    Ok(res)
}
