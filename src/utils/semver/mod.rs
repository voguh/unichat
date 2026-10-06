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

use anyhow::anyhow;
use anyhow::Error;

use crate::utils::semver::pre_release_type::PreReleaseType;
use crate::utils::semver::version::Version;

pub mod bound_type;
pub mod pre_release_type;
pub mod version_range;
pub mod version;

/* ========================================================================== */

pub fn compare(a: &str, b: &str) -> Ordering {
    let a_ver = Version::parse(a);
    let b_ver = Version::parse(b);

    match (a_ver, b_ver) {
        (Ok(a_parsed), Ok(b_parsed)) => a_parsed.cmp(&b_parsed),
        (Ok(_), Err(_)) => Ordering::Greater,
        (Err(_), Ok(_)) => Ordering::Less,
        (Err(_), Err(_)) => Ordering::Equal,
    }
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
