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
use std::cmp::Ordering;
use std::fmt::Display;

use anyhow::Error;
use anyhow::anyhow;

mod bound_type;
mod pre_release_type;
mod version;
mod version_range;

/* ========================================================================== */

pub use bound_type::BoundType;
pub use pre_release_type::PreReleaseType;
pub use version::Version;
pub use version_range::VersionRange;

/* ========================================================================== */

pub fn compare(a: &str, b: &str) -> Ordering {
    let a_ver = Version::parse(a);
    let b_ver = Version::parse(b);

    return match (a_ver, b_ver) {
        (Ok(a_parsed), Ok(b_parsed)) => a_parsed.cmp(&b_parsed),
        (Ok(_), Err(_)) => Ordering::Greater,
        (Err(_), Ok(_)) => Ordering::Less,
        (Err(_), Err(_)) => Ordering::Equal
    };
}

pub fn rcompare(a: &str, b: &str) -> Ordering {
    return compare(b, a);
}

pub fn gt(a: &str, b: &str) -> bool {
    return compare(a, b) == Ordering::Greater;
}

pub fn eq(a: &str, b: &str) -> bool {
    return compare(a, b) == Ordering::Equal;
}

pub fn lt(a: &str, b: &str) -> bool {
    return compare(a, b) == Ordering::Less;
}
