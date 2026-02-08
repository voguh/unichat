/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use crate::utils::semver::Version;
use crate::utils::semver::VersionRange;

#[test]
fn test_version_parse_simple() {
    let version = Version::parse("1.2.3").unwrap();
    assert_eq!(version.to_string(), "1.2.3");
}

#[test]
fn test_version_parse_with_pre_release() {
    let version = Version::parse("1.2.3-alpha.1").unwrap();
    assert_eq!(version.to_string(), "1.2.3-alpha.1");

    let version = Version::parse("2.0.0-beta.5").unwrap();
    assert_eq!(version.to_string(), "2.0.0-beta.5");

    let version = Version::parse("3.1.0-rc.2").unwrap();
    assert_eq!(version.to_string(), "3.1.0-rc.2");
}

#[test]
fn test_version_parse_with_build_metadata() {
    let version = Version::parse("1.2.3+build.123").unwrap();
    assert_eq!(version.to_string(), "1.2.3+build.123");
}

#[test]
fn test_version_compare() {
    let v1 = Version::parse("1.0.0").unwrap();
    let v2 = Version::parse("2.0.0").unwrap();
    assert!(v1.lt(&v2));
    assert!(v2.gt(&v1));

    let v3 = Version::parse("1.5.0").unwrap();
    let v4 = Version::parse("1.5.0").unwrap();
    assert!(v3.eq(&v4));

    let v5 = Version::parse("1.0.0-alpha").unwrap();
    let v6 = Version::parse("1.0.0-alpha.0").unwrap();
    assert!(v5.eq(&v6));
}

#[test]
fn test_version_pre_release_ordering() {
    let alpha = Version::parse("1.0.0-alpha.1").unwrap();
    let beta = Version::parse("1.0.0-beta.1").unwrap();
    let rc = Version::parse("1.0.0-rc.1").unwrap();
    let release = Version::parse("1.0.0").unwrap();

    assert!(alpha.lt(&beta));
    assert!(beta.lt(&rc));
    assert!(rc.lt(&release));
}

#[test]
fn test_version_range_parse_exact() {
    let range = VersionRange::parse("[1.2.3]").unwrap();
    let version = Version::parse("1.2.3").unwrap();
    assert!(range.matches(&version));

    let other = Version::parse("1.2.4").unwrap();
    assert!(!range.matches(&other));
}

#[test]
fn test_version_range_parse_simple() {
    let range: VersionRange = VersionRange::parse("1.2.3").unwrap();
    let version = Version::parse("1.2.3").unwrap();
    assert!(range.matches(&version));

    let higher = Version::parse("1.2.4").unwrap();
    assert!(range.matches(&higher));

    let lower = Version::parse("1.2.2").unwrap();
    assert!(!range.matches(&lower));
}

#[test]
fn test_version_range_inclusive() {
    let range = VersionRange::parse("[1.0.0,2.0.0]").unwrap();

    assert!(range.matches(&Version::parse("1.0.0").unwrap()));
    assert!(range.matches(&Version::parse("1.5.0").unwrap()));
    assert!(range.matches(&Version::parse("2.0.0").unwrap()));
    assert!(!range.matches(&Version::parse("0.9.0").unwrap()));
    assert!(!range.matches(&Version::parse("2.0.1").unwrap()));
}

#[test]
fn test_version_range_exclusive() {
    let range = VersionRange::parse("(1.0.0,2.0.0)").unwrap();

    assert!(!range.matches(&Version::parse("1.0.0").unwrap()));
    assert!(range.matches(&Version::parse("1.5.0").unwrap()));
    assert!(!range.matches(&Version::parse("2.0.0").unwrap()));
}

#[test]
fn test_version_range_mixed_bounds() {
    let range = VersionRange::parse("[1.0.0,2.0.0)").unwrap();
    assert!(range.matches(&Version::parse("1.0.0").unwrap()));
    assert!(range.matches(&Version::parse("1.9.9").unwrap()));
    assert!(!range.matches(&Version::parse("2.0.0").unwrap()));

    let range = VersionRange::parse("(1.0.0,2.0.0]").unwrap();
    assert!(!range.matches(&Version::parse("1.0.0").unwrap()));
    assert!(range.matches(&Version::parse("1.5.0").unwrap()));
    assert!(range.matches(&Version::parse("2.0.0").unwrap()));
}

#[test]
fn test_version_range_open_ended() {
    let range = VersionRange::parse("[1.0.0,)").unwrap();
    assert!(range.matches(&Version::parse("1.0.0").unwrap()));
    assert!(range.matches(&Version::parse("999.0.0").unwrap()));

    let range = VersionRange::parse("(,2.0.0]").unwrap();
    assert!(range.matches(&Version::parse("0.0.1").unwrap()));
    assert!(range.matches(&Version::parse("2.0.0").unwrap()));
    assert!(!range.matches(&Version::parse("2.0.1").unwrap()));
}

#[test]
fn test_version_range_display() {
    let range = VersionRange::parse("[1.0.0,2.0.0)").unwrap();
    assert_eq!(range.to_string(), "[1.0.0,2.0.0)");

    let range = VersionRange::parse("[1.2.3]").unwrap();
    assert_eq!(range.to_string(), "[1.2.3]");
}

#[test]
fn test_invalid_version() {
    assert!(Version::parse("not-a-version").is_err());
    assert!(Version::parse("1.2").is_err());
    assert!(Version::parse("").is_err());
}

#[test]
fn test_invalid_version_range() {
    assert!(VersionRange::parse("").is_err());
    assert!(VersionRange::parse("(,)").is_err());
    assert!(VersionRange::parse("[1.0.0,").is_err());
}
