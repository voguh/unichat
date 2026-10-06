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

use crate::utils::semver::pre_release_type::PreReleaseType;

/* ========================================================================== */

fn parse_number(value: &str) -> Result<i16, Error> {
    if value.is_empty() || !value.bytes().all(|b| b.is_ascii_digit()) {
        return Err(anyhow!("Invalid number: '{}'", value));
    } else if value.len() > 1 && value.starts_with('0') {
        return Err(anyhow!("Leading zeros are not allowed: '{}'", value));
    }

    return value.parse().map_err(|_| anyhow!("Failed to parse number '{}'", value));
}

fn pre_release_type_to_number(pre: &Option<(PreReleaseType, i16)>) -> (u8, i16) {
    let mut pre_type = 4;
    let mut pre_number = 0;

    if let Some((pre_release_type, pre_num)) = pre {
        match pre_release_type {
            PreReleaseType::Alpha => pre_type = 1,
            PreReleaseType::Beta => pre_type = 2,
            PreReleaseType::ReleaseCandidate => pre_type = 3
        }

        pre_number = *pre_num;
    }

    return (pre_type, pre_number);
}

/* ========================================================================== */

#[derive(Clone, Debug)]
pub struct Version {
    major: i16,
    minor: i16,
    patch: i16,
    pre_release: Option<(PreReleaseType, i16)>,
    build_metadata: Option<String>
}

impl Version {
    pub fn major(&self) -> i16 {
        return self.major;
    }

    pub fn minor(&self) -> i16 {
        return self.minor;
    }

    pub fn patch(&self) -> i16 {
        return self.patch;
    }

    pub fn pre_release(&self) -> Option<&PreReleaseType> {
        return self.pre_release.as_ref().map(|(pre_type, _)| pre_type);
    }

    pub fn pre_release_number(&self) -> Option<i16> {
        return self.pre_release.as_ref().map(|(_, pre_num)| *pre_num);
    }

    pub fn build_metadata(&self) -> Option<&String> {
        return self.build_metadata.as_ref();
    }

    /* ====================================================================== */

    fn new(major: i16, minor: i16, patch: i16, pre_release: Option<(PreReleaseType, i16)>, build_metadata: Option<&str>) -> Self {
        return Self { major, minor, patch, pre_release, build_metadata: build_metadata.map(|s| s.to_string()) };
    }

    /* ====================================================================== */

    pub fn parse(value: &str) -> Result<Self, Error> {
        let (main_part, build_metadata) = value.split_once('+').map(|(a, b)| (a, Some(b))).unwrap_or((value, None));
        if let Some(metadata) = &build_metadata {
            if metadata.is_empty() {
                return Err(anyhow!("Build metadata cannot be empty"));
            } else if !metadata.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '.') {
                return Err(anyhow!("Build metadata contains invalid characters"));
            }
        }

        let (version_numbers, pre_release_parts) = main_part.split_once('-').map(|(a, b)| (a, Some(b))).unwrap_or((main_part, None));

        /* ================================================================== */

        let numbers: Vec<&str> = version_numbers.split('.').collect();
        if numbers.len() != 3 {
            return Err(anyhow!("Invalid version string, expected MAJOR.MINOR.PATCH"));
        }

        /* ================================================================== */

        let mut pre_release = None;
        if let Some(pre_release_parts) = pre_release_parts {
            let parts: Vec<&str> = pre_release_parts.split('.').collect();
            if parts.len() > 2 {
                return Err(anyhow!("Invalid pre-release, expected TYPE.NUMBER"));
            }

            let pre_release_type = PreReleaseType::new(parts[0])?;
            let mut pre_release_number = 0;
            if parts.len() > 1 && !parts[1].is_empty() {
                pre_release_number = parse_number(parts[1])?;
            }

            pre_release = Some((pre_release_type, pre_release_number));
        }

        /* ================================================================== */

        let major = parse_number(numbers[0])?;
        let minor = parse_number(numbers[1])?;
        let patch = parse_number(numbers[2])?;
        return Ok(Version::new(major, minor, patch, pre_release, build_metadata));
    }
}

impl Ord for Version {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        if self.major != other.major {
            return self.major.cmp(&other.major);
        } else if self.minor != other.minor {
            return self.minor.cmp(&other.minor);
        } else if self.patch != other.patch {
            return self.patch.cmp(&other.patch);
        }

        let (self_pre_type, self_pre_number) = pre_release_type_to_number(&self.pre_release);
        let (other_pre_type, other_pre_number) = pre_release_type_to_number(&other.pre_release);
        if self_pre_type != other_pre_type {
            return self_pre_type.cmp(&other_pre_type);
        }

        return self_pre_number.cmp(&other_pre_number);
    }
}

impl PartialEq for Version {
    fn eq(&self, other: &Self) -> bool {
        return self.cmp(other) == std::cmp::Ordering::Equal;
    }
}

impl Eq for Version {}

impl PartialOrd for Version {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        return Some(self.cmp(other));
    }
}

impl Display for Version {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}.{}.{}", self.major, self.minor, self.patch)?;

        if let Some((pre_type, pre_num)) = &self.pre_release {
            write!(f, "-{}.{}", pre_type, pre_num)?;
        }

        if let Some(build) = &self.build_metadata {
            write!(f, "+{}", build)?;
        }

        return Ok(());
    }
}
