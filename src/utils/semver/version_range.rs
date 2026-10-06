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

use crate::utils::semver::bound_type::BoundType;
use crate::utils::semver::version::Version;

/* ========================================================================== */

const INCLUSIVE_START: &str = "[";
const INCLUSIVE_END: &str = "]";
const EXCLUSIVE_START: &str = "(";
const EXCLUSIVE_END: &str = ")";

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VersionRange {
    min: Option<(BoundType, Version)>,
    max: Option<(BoundType, Version)>
}

impl VersionRange {

    pub fn min(&self) -> Option<&(BoundType, Version)> {
        return self.min.as_ref();
    }

    pub fn max(&self) -> Option<&(BoundType, Version)> {
        return self.max.as_ref();
    }

    /* ====================================================================== */

    fn new(min: Option<(BoundType, Version)>, max: Option<(BoundType, Version)>) -> Self {
        return Self { min, max };
    }

    /* ====================================================================== */

    pub fn matches(&self, version: &Version) -> bool {
        if let (true, Some((_, min_version))) = (self.is_exact(), &self.min) {
            return version.eq(min_version);
        }

        let mut min_ok = self.min.is_none();
        if let Some((min_bound, min_version)) = &self.min {
            if min_bound == &BoundType::Inclusive {
                min_ok = version.eq(min_version) || version.gt(min_version);
            } else if min_bound == &BoundType::Exclusive {
                min_ok = version.gt(min_version);
            }
        }

        let mut max_ok = self.max.is_none();
        if let Some((max_bound, max_version)) = &self.max {
            if max_bound == &BoundType::Inclusive {
                max_ok = version.eq(max_version) || version.lt(max_version);
            } else if max_bound == &BoundType::Exclusive {
                max_ok = version.lt(max_version);
            }
        }

        return min_ok && max_ok;
    }

    /* ====================================================================== */

    fn is_exact(&self) -> bool {
        if let (Some((min_bound, min_version)), Some((max_bound, max_version))) = (&self.min, &self.max) {
            return min_version.eq(max_version) && min_bound == &BoundType::Inclusive && max_bound == &BoundType::Inclusive;
        }

        return false;
    }

    /* ====================================================================== */

    pub fn parse(value: &str) -> Result<Self, Error> {
        let mut value = String::from(value);
        if value.is_empty() {
            return Err(anyhow!("Empty version range string"));
        }

        let has_comma = value.contains(',');
        if has_comma {
            if !(value.starts_with(INCLUSIVE_START) || value.starts_with(EXCLUSIVE_START)) {
                return Err(anyhow!("Version range contains a comma, it must start with [ or ("));
            } else if !(value.ends_with(INCLUSIVE_END) || value.ends_with(EXCLUSIVE_END)) {
                return Err(anyhow!("Version range contains a comma, it must end with ] or )"));
            }
        } else {
            if value.contains(EXCLUSIVE_START) || value.contains(EXCLUSIVE_END) {
                return Err(anyhow!("Version range does not contain a comma, it cannot contain ( or )"));
            }

            let starts_with_inclusive = value.starts_with(INCLUSIVE_START);
            let ends_with_inclusive = value.ends_with(INCLUSIVE_END);

            // Strict version range with both inclusive start and end
            if starts_with_inclusive && ends_with_inclusive {
                let version = String::from(&value[1..value.len() - 1]);
                let version = Version::parse(&version)?;

                return Ok(Self {
                    min: Some((BoundType::Inclusive, version.clone())),
                    max: Some((BoundType::Inclusive, version))
                });
            }

            if starts_with_inclusive {
                return Err(anyhow!("Version range starting with [ must end with ]"));
            } else if ends_with_inclusive {
                return Err(anyhow!("Version range ending with ] must start with ["));
            }

            // Version without explicit bounds, assume inclusive start and exclusive end
            value = format!("{}{},{}", INCLUSIVE_START, value, EXCLUSIVE_END);
        }

        /* ================================================================== */

        let (min_part, max_part) = value.split_once(',').ok_or(anyhow!("Invalid version range format"))?;

        let mut min_bound: Option<BoundType> = None;
        let mut min_version: Option<Version> = None;
        if min_part == INCLUSIVE_START {
            return Err(anyhow!("Minimum version part cannot be empty with only ["));
        } else if min_part != EXCLUSIVE_START {
            let bound = BoundType::new(&min_part[0..1])?;
            let version_str = Version::parse(&min_part[1..])?;

            min_bound = Some(bound);
            min_version = Some(version_str);
        }

        let mut max_bound: Option<BoundType> = None;
        let mut max_version: Option<Version> = None;
        if max_part == INCLUSIVE_END {
            return Err(anyhow!("Maximum version part cannot be empty with only ]"));
        } else if max_part != EXCLUSIVE_END {
            let bound = BoundType::new(&max_part[max_part.len() - 1..])?;
            let version_str = Version::parse(&max_part[..max_part.len() - 1])?;

            max_bound = Some(bound);
            max_version = Some(version_str);
        }

        if min_version.is_none() && max_version.is_none() {
            return Err(anyhow!("At least one of minimum or maximum version must be specified"));
        }

        if let (Some(min_version), Some(max_version)) = (&min_version, &max_version) {
            match min_version.cmp(max_version) {
                std::cmp::Ordering::Greater => {
                    return Err(anyhow!("Minimum version is greater than maximum version"));
                },
                std::cmp::Ordering::Equal => {
                    let both_inclusive = min_bound == Some(BoundType::Inclusive) && max_bound == Some(BoundType::Inclusive);
                    if !both_inclusive {
                        return Err(anyhow!("Equal bounds require [x] (both inclusive)"));
                    }
                },
                _ => {}
            }
        }

        let mut min = None;
        if let Some(min_version) = &min_version {
            min = Some((min_bound.unwrap(), min_version.clone()));
        }

        let mut max = None;
        if let Some(max_version) = &max_version {
            max = Some((max_bound.unwrap(), max_version.clone()));
        }

        return Ok(VersionRange::new(min, max));
    }
}

impl Display for VersionRange {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let (true, Some((_, min_version))) = (self.is_exact(), &self.min) {
            return write!(f, "{}{}{}", INCLUSIVE_START, min_version, INCLUSIVE_END);
        }

        let mut min_str = String::from(EXCLUSIVE_START);
        if let Some((min_bound, min_version)) = &self.min {
            if min_bound == &BoundType::Inclusive {
                min_str = format!("{}{}", INCLUSIVE_START, min_version);
            } else if min_bound == &BoundType::Exclusive {
                min_str = format!("{}{}", EXCLUSIVE_START, min_version);
            }
        }

        let mut max_str = String::from(EXCLUSIVE_END);
        if let Some((max_bound, max_version)) = &self.max {
            if max_bound == &BoundType::Inclusive {
                max_str = format!("{}{}", max_version, INCLUSIVE_END);
            } else if max_bound == &BoundType::Exclusive {
                max_str = format!("{}{}", max_version, EXCLUSIVE_END);
            }
        }

        return write!(f, "{},{}", min_str, max_str);
    }
}
