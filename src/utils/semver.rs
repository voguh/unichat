/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::fmt::Display;

use anyhow::anyhow;
use anyhow::Error;

fn parse_optional_u32(value: Option<&str>) -> Result<Option<u32>, Error> {
    if let Some(value) = value {
        if value.trim().is_empty() {
            return Ok(None);
        }

        let parsed: u32 = value.parse()?;
        return Ok(Some(parsed));
    }

    return Ok(None);
}

fn pre_release_type_to_number(pre: &Option<PreReleaseType>) -> u8 {
    match pre {
        Some(PreReleaseType::Alpha) => 1,
        Some(PreReleaseType::Beta) => 2,
        Some(PreReleaseType::ReleaseCandidate) => 3,
        None => 4,
    }
}

/* ================================================================================================================== */

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum BoundType {
    Inclusive,
    Exclusive,
}

impl BoundType {
    pub fn new(value: &str) -> Result<Self, Error> {
        let value = value.trim();

        if matches!(value, "[" | "]") {
            return Ok(BoundType::Inclusive);
        } else if matches!(value, "(" | ")") {
            return Ok(BoundType::Exclusive);
        }

        return Err(anyhow!("Invalid bound type: {}", value));
    }
}

/* ================================================================================================================== */

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PreReleaseType {
    Alpha,
    Beta,
    ReleaseCandidate,
}

impl PreReleaseType {
    pub fn new(value: &str) -> Result<Self, Error> {
        let value = value.trim().to_lowercase();

        if value == "alpha" {
            return Ok(PreReleaseType::Alpha);
        } else if value == "beta" {
            return Ok(PreReleaseType::Beta);
        } else if value == "rc" {
            return Ok(PreReleaseType::ReleaseCandidate);
        }

        return Err(anyhow!("Invalid pre-release type: {}", value));
    }
}

impl Display for PreReleaseType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PreReleaseType::Alpha => write!(f, "alpha"),
            PreReleaseType::Beta => write!(f, "beta"),
            PreReleaseType::ReleaseCandidate => write!(f, "rc"),
        }
    }
}

/* ================================================================================================================== */

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Version {
    major: u32,
    minor: u32,
    patch: u32,
    pre_release: Option<PreReleaseType>,
    pre_release_number: Option<u32>,
    build_metadata: Option<String>,
}

impl Version {
    pub fn parse(value: &str) -> Result<Self, Error> {
        let mut main_and_meta = value.split('+');
        let main_part = main_and_meta
            .next()
            .ok_or(anyhow!("Invalid version string"))?;
        let build_metadata = main_and_meta.next();

        let mut main_and_pre = main_part.split('-');
        let version_numbers = main_and_pre
            .next()
            .ok_or(anyhow!("Invalid version string"))?;
        let pre_release_parts = main_and_pre.next();

        /* ================================================================== */

        let mut numbers_iter = version_numbers.split('.');
        let major = numbers_iter
            .next()
            .ok_or(anyhow!("Invalid version string"))?;
        let minor = numbers_iter
            .next()
            .ok_or(anyhow!("Invalid version string"))?;
        let patch = numbers_iter
            .next()
            .ok_or(anyhow!("Invalid version string"))?;

        /* ================================================================== */

        let mut pre_release = None;
        let mut pre_release_number = None;
        if let Some(pre_release_parts) = pre_release_parts {
            let mut pre_release_split = pre_release_parts.split('.');

            pre_release = pre_release_split
                .next()
                .map(|s| PreReleaseType::new(s))
                .transpose()?;
            pre_release_number = parse_optional_u32(pre_release_split.next())?;

            if pre_release.is_some() && pre_release_number.is_none() {
                pre_release_number = Some(0);
            }
        }

        return Ok(Version {
            major: major.parse()?,
            minor: minor.parse()?,
            patch: patch.parse()?,
            pre_release: pre_release,
            pre_release_number: pre_release_number,
            build_metadata: build_metadata.map(|s| s.to_string()),
        });
    }

    pub fn compare(&self, other: &Version) -> std::cmp::Ordering {
        let self_major = self.major;
        let self_minor = self.minor;
        let self_patch = self.patch;

        let other_major = other.major;
        let other_minor = other.minor;
        let other_patch = other.patch;

        if self_major != other_major {
            return self_major.cmp(&other_major);
        } else if self_minor != other_minor {
            return self_minor.cmp(&other_minor);
        } else if self_patch != other_patch {
            return self_patch.cmp(&other_patch);
        }

        let self_pre_type = pre_release_type_to_number(&self.pre_release);
        let other_pre_type = pre_release_type_to_number(&other.pre_release);
        if self_pre_type != other_pre_type {
            return self_pre_type.cmp(&other_pre_type);
        } else {
            let self_pre_number = self.pre_release_number.unwrap_or(0);
            let other_pre_number = other.pre_release_number.unwrap_or(0);
            return self_pre_number.cmp(&other_pre_number);
        }
    }

    pub fn gt(&self, other: &Version) -> bool {
        return self.compare(other) == std::cmp::Ordering::Greater;
    }

    pub fn lt(&self, other: &Version) -> bool {
        return self.compare(other) == std::cmp::Ordering::Less;
    }

    pub fn eq(&self, other: &Version) -> bool {
        return self.compare(other) == std::cmp::Ordering::Equal;
    }
}

impl Display for Version {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}.{}.{}", self.major, self.minor, self.patch)?;

        if let Some(pre) = &self.pre_release {
            write!(f, "-{}", pre.to_string())?;

            if let Some(pre_num) = &self.pre_release_number {
                write!(f, ".{}", pre_num)?;
            }
        }

        if let Some(build) = &self.build_metadata {
            write!(f, "+{}", build)?;
        }

        Ok(())
    }
}

/* ================================================================================================================== */

const INCLUSIVE_START: &str = "[";
const INCLUSIVE_END: &str = "]";
const EXCLUSIVE_START: &str = "(";
const EXCLUSIVE_END: &str = ")";

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VersionRange {
    min: Option<(BoundType, Version)>,
    max: Option<(BoundType, Version)>,
}

impl VersionRange {
    pub fn parse(value: &str) -> Result<Self, Error> {
        let mut value: String = value.chars().filter(|c| !c.is_whitespace()).collect();
        if value.is_empty() {
            return Err(anyhow!("Empty version range string"));
        }

        let mut has_comma = value.contains(',');
        if has_comma {
            if !(value.starts_with(INCLUSIVE_START) || value.starts_with(EXCLUSIVE_START)) {
                return Err(anyhow!("Invalid version range string, when version req contains a comma, it must start with [ or ("));
            } else if !(value.ends_with(INCLUSIVE_END) || value.ends_with(EXCLUSIVE_END)) {
                return Err(anyhow!("Invalid version range string, when version req contains a comma, it must end with ] or )"));
            }
        } else {
            if value.contains(EXCLUSIVE_START) || value.contains(EXCLUSIVE_END) {
                return Err(anyhow!("Invalid version range string, when version req does not contain a comma, it cannot contain ( or )"));
            }

            let starts_with_inclusive = value.starts_with(INCLUSIVE_START);
            let ends_with_inclusive = value.ends_with(INCLUSIVE_END);
            if starts_with_inclusive && !ends_with_inclusive {
                return Err(anyhow!("Version range starting with [ must end with ]"));
            } else if ends_with_inclusive && !starts_with_inclusive {
                return Err(anyhow!("Version range ending with ] must start with ["));
            }

            if !starts_with_inclusive && !ends_with_inclusive {
                value = format!("{}{},{}", INCLUSIVE_START, value, EXCLUSIVE_END);
                has_comma = true;
            }
        }

        if !has_comma {
            let version = value.trim_start_matches(INCLUSIVE_START).trim_end_matches(INCLUSIVE_END).trim();
            let version = Version::parse(version)?;

            return Ok(Self {
                min: Some((BoundType::Inclusive, version.clone())),
                max: Some((BoundType::Inclusive, version))
            });
        }

        let mut parts = value.splitn(2, ',');

        let min_part = parts.next().map(|s| s.trim()).ok_or(anyhow!("Missing minimum version part"))?;
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

        let max_part = parts.next().map(|s| s.trim()).ok_or(anyhow!("Missing maximum version part"))?;
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

        let mut min = None;
        if let Some(min_version) = &min_version {
            min = Some((min_bound.unwrap(), min_version.clone()));
        }

        let mut max = None;
        if let Some(max_version) = &max_version {
            max = Some((max_bound.unwrap(), max_version.clone()));
        }

        return Ok(Self { min, max });
    }

    pub fn matches(&self, version: &Version) -> bool {
        if let (Some((min_bound, min_version)), Some((max_bound, max_version))) = (&self.min, &self.max) {
            if min_version.eq(max_version) && min_bound == &BoundType::Inclusive && max_bound == &BoundType::Inclusive {
                return version.eq(min_version);
            }
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
}

impl Display for VersionRange {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let (Some((min_bound, min_version)), Some((max_bound, max_version))) = (&self.min, &self.max) {
            if min_version.eq(max_version) && min_bound == &BoundType::Inclusive && max_bound == &BoundType::Inclusive {
                return write!(f, "{}{}{}", INCLUSIVE_START, min_version, INCLUSIVE_END);
            }
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
