/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::cmp::Ordering;
use std::fmt::Display;

use anyhow::Error;
use anyhow::anyhow;

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
        let mut min_ok = true;
        if let Some((min_bound, min_version)) = &self.min {
            match min_bound {
                BoundType::Inclusive => min_ok = version >= min_version,
                BoundType::Exclusive => min_ok = version > min_version
            }
        }

        let mut max_ok = true;
        if let Some((max_bound, max_version)) = &self.max {
            match max_bound {
                BoundType::Inclusive => max_ok = version <= max_version,
                BoundType::Exclusive => max_ok = version < max_version
            }
        }

        return min_ok && max_ok;
    }

    /* ====================================================================== */

    fn is_exact(&self) -> bool {
        if let (Some((min_bound, min_version)), Some((max_bound, max_version))) = (&self.min, &self.max) {
            if min_version != max_version {
                return false;
            }

            return min_bound == &BoundType::Inclusive && max_bound == &BoundType::Inclusive;
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
                return Err(anyhow!("Missing start bound in version range '{}'", value));
            } else if !(value.ends_with(INCLUSIVE_END) || value.ends_with(EXCLUSIVE_END)) {
                return Err(anyhow!("Missing end bound in version range '{}'", value));
            }
        } else {
            if value.contains(EXCLUSIVE_START) || value.contains(EXCLUSIVE_END) {
                return Err(anyhow!("Unexpected exclusive bound in version range '{}'", value));
            }

            let starts_with_inclusive = value.starts_with(INCLUSIVE_START);
            let ends_with_inclusive = value.ends_with(INCLUSIVE_END);

            if starts_with_inclusive && ends_with_inclusive {
                let version = Version::parse(&value[1..value.len() - 1])?;

                return Ok(Self {
                    min: Some((BoundType::Inclusive, version.clone())),
                    max: Some((BoundType::Inclusive, version))
                });
            }

            if starts_with_inclusive {
                return Err(anyhow!("Missing end bound in version range '{}'", value));
            } else if ends_with_inclusive {
                return Err(anyhow!("Missing start bound in version range '{}'", value));
            }

            // Version without explicit bounds, assume inclusive start and exclusive end
            value = format!("{}{},{}", INCLUSIVE_START, value, EXCLUSIVE_END);
        }

        /* ================================================================== */

        let (min_part, max_part) = value.split_once(',').expect("Version range has a comma at this point");

        let mut min = None;
        if min_part == INCLUSIVE_START {
            return Err(anyhow!("Empty minimum version in version range '{}'", value));
        } else if min_part != EXCLUSIVE_START {
            let bound = BoundType::new(&min_part[0..1])?;
            let version = Version::parse(&min_part[1..])?;
            min = Some((bound, version));
        }

        let mut max = None;
        if max_part == INCLUSIVE_END {
            return Err(anyhow!("Empty maximum version in version range '{}'", value));
        } else if max_part != EXCLUSIVE_END {
            let bound = BoundType::new(&max_part[max_part.len() - 1..])?;
            let version = Version::parse(&max_part[..max_part.len() - 1])?;
            max = Some((bound, version));
        }

        if min.is_none() && max.is_none() {
            return Err(anyhow!("Unbounded version range '{}'", value));
        }

        if let (Some((min_bound, min_version)), Some((max_bound, max_version))) = (&min, &max) {
            match min_version.cmp(max_version) {
                Ordering::Greater => {
                    return Err(anyhow!("Minimum version greater than maximum in version range '{}'", value));
                }
                Ordering::Equal => {
                    let both_inclusive = min_bound == &BoundType::Inclusive && max_bound == &BoundType::Inclusive;
                    if !both_inclusive {
                        return Err(anyhow!("Exclusive equal bounds in version range '{}'", value));
                    }
                }
                Ordering::Less => {}
            }
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
            match min_bound {
                BoundType::Inclusive => min_str = format!("{}{}", INCLUSIVE_START, min_version),
                BoundType::Exclusive => min_str = format!("{}{}", EXCLUSIVE_START, min_version)
            }
        }

        let mut max_str = String::from(EXCLUSIVE_END);
        if let Some((max_bound, max_version)) = &self.max {
            match max_bound {
                BoundType::Inclusive => max_str = format!("{}{}", max_version, INCLUSIVE_END),
                BoundType::Exclusive => max_str = format!("{}{}", max_version, EXCLUSIVE_END)
            }
        }

        return write!(f, "{},{}", min_str, max_str);
    }
}
