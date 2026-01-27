/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

#![allow(unused)]
pub use base64::DecodeError;
pub use base64::DecodeSliceError;
pub use base64::Engine;
pub use base64::alphabet;
pub use base64::decoded_len_estimate;
pub use base64::display;
pub use base64::encoded_len;
pub use base64::engine;
pub use base64::prelude;
pub use base64::read;
pub use base64::write;

pub fn encode<T: AsRef<[u8]>>(input: T) -> String {
    return base64::engine::general_purpose::STANDARD.encode(input);
}

pub fn decode<T: AsRef<[u8]>>(input: T) -> Result<Vec<u8>, DecodeError> {
    return base64::engine::general_purpose::STANDARD.decode(input);
}
