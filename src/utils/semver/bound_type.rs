/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::anyhow;
use anyhow::Error;

/* ========================================================================== */

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum BoundType {
    Inclusive,
    Exclusive
}

impl BoundType {
    pub fn new(value: &str) -> Result<Self, Error> {
        if matches!(value, "[" | "]") {
            return Ok(BoundType::Inclusive);
        } else if matches!(value, "(" | ")") {
            return Ok(BoundType::Exclusive);
        }

        return Err(anyhow!("Invalid bound type: {}", value));
    }
}
