
use actix_web::{get, web, Error, HttpRequest, HttpResponse};
use bytestring::ByteString;

use crate::events;

#[get("/ws")]
async fn ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let (res, session, _message_stream) = actix_ws::handle(&req, stream)?;
    let mut emitter = events::INSTANCE.lock().unwrap();

    let closure = move |payload: &str| {
        let mut session_clone = session.clone();
        let data = ByteString::from(payload);

        tokio::spawn(async move {
            if let Err(err) = session_clone.text(data).await {
                eprintln!("Falha ao enviar o evento: {}", err);
            }
        });
    };

    emitter.on("unichat:event", closure);

    Ok(res)
}
