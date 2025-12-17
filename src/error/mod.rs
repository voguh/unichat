/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

#[non_exhaustive]
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("lock poisoned")]
    LockPoisoned { #[source] source: Box<dyn std::error::Error> },
    #[error(transparent)]
    Time(#[from] std::time::SystemTimeError),
    #[error(transparent)]
    ParseFloat(#[from] std::num::ParseFloatError),
    #[error(transparent)]
    ParseInt(#[from] std::num::ParseIntError),

    #[error("OnceLock '{0}' was already initialized")]
    OnceLockAlreadyInitialized(&'static str),
    #[error("OnceLock '{0}' was not initialized yet")]
    OnceLockNotInitialized(&'static str),

    #[error(transparent)]
    SerdeJson(#[from] serde_json::error::Error),
    #[error("serde_plain error")]
    SerdePlain { ty: &'static str, msg: String },
    #[error(transparent)]
    UrlParse(#[from] url::ParseError),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error(transparent)]
    Ureq(#[from] ureq::Error),
    #[error("tokio broadcast send error")]
    TokioSendError { #[source] source: Box<dyn std::error::Error> },
    #[error(transparent)]
    TimeParse(#[from] time::error::Parse),

    #[error("{0}")]
    Message(String),

    #[error(transparent)]
    Generic(#[from] Box<dyn std::error::Error + Send + Sync + 'static>),
}

impl serde::Serialize for Error {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        log::error!("{:?}", self);
        return serializer.serialize_str(&self.to_string().as_str());
    }
}

impl From<&str> for Error {
    fn from(s: &str) -> Self {
        return Error::Message(s.to_string());
    }
}

impl From<String> for Error {
    fn from(s: String) -> Self {
        return Error::Message(s);
    }
}

impl From<tauri_plugin_store::Error> for Error {
    fn from(e: tauri_plugin_store::Error) -> Self {
        use tauri_plugin_store::Error as E;

        let is_known_error = matches!(&e, E::Json(_) | E::Io(_) | E::Tauri(_) | E::SerializeFunctionNotFound(_) | E::DeserializeFunctionNotFound(_));
        if !is_known_error {
            return Error::Generic(Box::new(e));
        }

        return match e {
            E::Json(e) => Error::SerdeJson(e),
            E::Io(e) => Error::Io(e),
            E::Tauri(e) => Error::Tauri(e),
            E::SerializeFunctionNotFound(e) => Error::Message(e),
            E::DeserializeFunctionNotFound(e) => Error::Message(e),
            _ => unreachable!()
        }
    }
}

impl From<serde_plain::Error> for Error {
    fn from(e: serde_plain::Error) -> Self {
        return match e {
            serde_plain::Error::ImpossibleSerialization(ty) => Error::SerdePlain { ty, msg: String::from("cannot serialize non primitive type") },
            serde_plain::Error::ImpossibleDeserialization(ty) => Error::SerdePlain { ty, msg: String::from("cannot deserialize to non primitive type") },
            serde_plain::Error::Message(msg) => Error::Message(msg),
            serde_plain::Error::Parse(ty, msg) => Error::SerdePlain { ty, msg: msg.clone() },
        }
    }
}
