/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fmt::Display;

use anyhow::anyhow;
use anyhow::Error;

/* ========================================================================== */

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PreReleaseType {
    Alpha,
    Beta,
    ReleaseCandidate
}

impl PreReleaseType {
    pub fn new(value: &str) -> Result<Self, Error> {
        if value == "alpha" {
            return Ok(PreReleaseType::Alpha);
        } else if value == "beta" {
            return Ok(PreReleaseType::Beta);
        } else if value == "rc" {
            return Ok(PreReleaseType::ReleaseCandidate);
        }

        return Err(anyhow!("Value '{}' is not a valid pre-release type", value));
    }
}

impl Display for PreReleaseType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PreReleaseType::Alpha => write!(f, "alpha"),
            PreReleaseType::Beta => write!(f, "beta"),
            PreReleaseType::ReleaseCandidate => write!(f, "rc")
        }
    }
}
