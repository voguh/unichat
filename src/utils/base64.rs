/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
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
