use actix_web::{get, web, Error, HttpRequest, HttpResponse};
use bytestring::ByteString;

use crate::events;

#[get("/ws")]
async fn ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let (res, session, _stream) = actix_ws::handle(&req, stream)?;
    let mut emitter = events::INSTANCE.lock().unwrap();
    emitter.on("unichat:event", move |payload: &str| {
        let mut session_clone = session.clone();
        let data = ByteString::from(payload);

        tauri::async_runtime::spawn(async move {
            if let Err(err) = session_clone.text(data).await {
                eprintln!("An error occurred on emit event: {}", err);
            }
        });
    });

    Ok(res)
}
