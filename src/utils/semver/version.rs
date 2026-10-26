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

use crate::utils::semver::pre_release_type::PreReleaseType;

/* ========================================================================== */

fn parse_number(value: &str) -> Result<u16, Error> {
    if value.is_empty() || !value.bytes().all(|b| b.is_ascii_digit()) {
        return Err(anyhow!("Invalid number: '{}'", value));
    } else if value.len() > 1 && value.starts_with('0') {
        return Err(anyhow!("Leading zeros are not allowed: '{}'", value));
    }

    return value.parse().map_err(|_| anyhow!("Failed to parse number '{}'", value));
}

/* ========================================================================== */

#[derive(Clone, Debug)]
pub struct Version {
    major: u16,
    minor: u16,
    patch: u16,
    pre_release: Option<(PreReleaseType, u16)>,
    build_metadata: Option<String>
}

impl Version {
    pub fn major(&self) -> u16 {
        return self.major;
    }

    pub fn minor(&self) -> u16 {
        return self.minor;
    }

    pub fn patch(&self) -> u16 {
        return self.patch;
    }

    pub fn pre_release(&self) -> Option<&PreReleaseType> {
        return self.pre_release.as_ref().map(|(pre_type, _)| pre_type);
    }

    pub fn pre_release_number(&self) -> Option<u16> {
        return self.pre_release.as_ref().map(|(_, pre_num)| *pre_num);
    }

    pub fn build_metadata(&self) -> Option<&String> {
        return self.build_metadata.as_ref();
    }

    /* ====================================================================== */

    fn new(
        major: u16,
        minor: u16,
        patch: u16,
        pre_release: Option<(PreReleaseType, u16)>,
        build_metadata: Option<&str>
    ) -> Self {
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

        let mut version_numbers = main_part;
        let mut pre_release_parts = None;
        if let Some((numbers, pre_release)) = main_part.split_once('-') {
            version_numbers = numbers;
            pre_release_parts = Some(pre_release);
        }

        /* ================================================================== */

        let numbers: Vec<&str> = version_numbers.split('.').collect();
        if numbers.len() != 3 {
            return Err(anyhow!("Invalid version '{}'", value));
        }

        /* ================================================================== */

        let mut pre_release = None;
        if let Some(pre_release_parts) = pre_release_parts {
            let parts: Vec<&str> = pre_release_parts.split('.').collect();
            if parts.len() > 2 {
                return Err(anyhow!("Invalid pre-release '{}'", pre_release_parts));
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
    fn cmp(&self, other: &Self) -> Ordering {
        let numbers = (self.major, self.minor, self.patch).cmp(&(other.major, other.minor, other.patch));
        if numbers != Ordering::Equal {
            return numbers;
        }

        return match (&self.pre_release, &other.pre_release) {
            (Some(self_pre), Some(other_pre)) => self_pre.cmp(other_pre),
            (Some(_), None) => Ordering::Less,
            (None, Some(_)) => Ordering::Greater,
            (None, None) => Ordering::Equal
        };
    }
}

impl PartialEq for Version {
    fn eq(&self, other: &Self) -> bool {
        return self.cmp(other) == Ordering::Equal;
    }
}

impl Eq for Version {}

impl PartialOrd for Version {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
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
