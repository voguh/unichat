/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

#![allow(unused)]
use std::sync::LazyLock;

pub use ureq::Agent;
pub use ureq::AsSendBody;
pub use ureq::Body;
pub use ureq::BodyBuilder;
pub use ureq::BodyReader;
pub use ureq::BodyWithConfig;
pub use ureq::Error;
pub use ureq::Proxy;
pub use ureq::ProxyBuilder;
pub use ureq::ProxyProtocol;
pub use ureq::RequestBuilder;
pub use ureq::RequestExt;
pub use ureq::ResponseExt;
pub use ureq::SendBody;
pub use ureq::Timeout;
use ureq::config::Config;
use ureq::http::Uri;
use ureq::tls::TlsConfig;
use ureq::tls::TlsProvider;
use ureq::typestate::WithBody;
use ureq::typestate::WithoutBody;

pub mod config {
    pub use ureq::config::*;
}

pub mod http {
    pub use ureq::http::*;
}

pub mod middleware {
    pub use ureq::middleware::*;
}

pub mod tls {
    pub use ureq::tls::*;
}

pub mod typestate {
    pub use ureq::typestate::*;
}

pub mod unversioned {
    pub use ureq::unversioned::*;
}

static UREQ_AGENT: LazyLock<ureq::Agent> = LazyLock::new(|| {
    let config = Config::builder()
        .tls_config(
            TlsConfig::builder()
                .provider(TlsProvider::NativeTls)
                .root_certs(ureq::tls::RootCerts::PlatformVerifier)
                .build()
        )
        .build();

    return config.new_agent();
});

#[must_use]
pub fn get<T>(uri: T) -> RequestBuilder<WithoutBody>
    where Uri: TryFrom<T>, <Uri as TryFrom<T>>::Error: Into<http::Error> {
    return UREQ_AGENT.get(uri);
}

#[must_use]
pub fn post<T>(uri: T) -> RequestBuilder<WithBody>
    where Uri: TryFrom<T>, <Uri as TryFrom<T>>::Error: Into<http::Error> {
    return UREQ_AGENT.post(uri);
}

#[must_use]
pub fn put<T>(uri: T) -> RequestBuilder<WithBody>
    where Uri: TryFrom<T>, <Uri as TryFrom<T>>::Error: Into<http::Error> {
    return UREQ_AGENT.put(uri);
}

#[must_use]
pub fn patch<T>(uri: T) -> RequestBuilder<WithBody>
    where Uri: TryFrom<T>, <Uri as TryFrom<T>>::Error: Into<http::Error> {
    return UREQ_AGENT.patch(uri);
}

#[must_use]
pub fn delete<T>(uri: T) -> RequestBuilder<WithoutBody>
    where Uri: TryFrom<T>, <Uri as TryFrom<T>>::Error: Into<http::Error> {
    return UREQ_AGENT.delete(uri);
}

#[must_use]
pub fn head<T>(uri: T) -> RequestBuilder<WithoutBody>
    where Uri: TryFrom<T>, <Uri as TryFrom<T>>::Error: Into<http::Error> {
    return UREQ_AGENT.head(uri);
}

#[must_use]
pub fn options<T>(uri: T) -> RequestBuilder<WithoutBody>
    where Uri: TryFrom<T>, <Uri as TryFrom<T>>::Error: Into<http::Error> {
    return UREQ_AGENT.options(uri);
}

#[must_use]
pub fn connect<T>(uri: T) -> RequestBuilder<WithoutBody>
    where Uri: TryFrom<T>, <Uri as TryFrom<T>>::Error: Into<http::Error> {
    return UREQ_AGENT.connect(uri);
}

#[must_use]
pub fn trace<T>(uri: T) -> RequestBuilder<WithoutBody>
    where Uri: TryFrom<T>, <Uri as TryFrom<T>>::Error: Into<http::Error> {
    return UREQ_AGENT.trace(uri);
}
