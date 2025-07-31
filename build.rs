/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

#![warn(clippy::implicit_return)]
#![allow(clippy::needless_return)]
#![allow(clippy::redundant_field_names)]

use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

// I will not implement any api to get license information.
// This is a "safe guard" to remember me to change license info if I change the license.
fn get_license_info(license: &str) -> Result<(String, String), Box<dyn std::error::Error>> {
    let mut licenses: HashMap<&str, (&str, &str)> = HashMap::new();
    licenses.insert("MPL-2.0", ("Mozilla Public License, Version 2.0", "https://www.mozilla.org/en-US/MPL/2.0/"));

    if let Some((name, url)) = licenses.get(license) {
        return Ok((name.to_string(), url.to_string()));
    } else {
        return Err(format!("Unknown license: {}", license).into());
    }
}

fn generate_resources(root_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let target_gen_dir = root_dir.join("target").join("gen");

    let display_name = "UniChat";
    let name = env!("CARGO_PKG_NAME");
    let version = env!("CARGO_PKG_VERSION");
    let description = env!("CARGO_PKG_DESCRIPTION");
    let authors = env!("CARGO_PKG_AUTHORS");
    let homepage = env!("CARGO_PKG_HOMEPAGE");
    let license_code = env!("CARGO_PKG_LICENSE");
    let (license_name, license_url) = get_license_info(license_code)?;

    if !target_gen_dir.exists() {
        fs::create_dir_all(&target_gen_dir)?;
    }

    let metadata = format!(r#"
        pub const CARGO_PKG_DISPLAY_NAME: &str = "{display_name}";
        pub const CARGO_PKG_NAME: &str = "{name}";
        pub const CARGO_PKG_VERSION: &str = "{version}";
        pub const CARGO_PKG_DESCRIPTION: &str = "{description}";
        pub const CARGO_PKG_AUTHORS: &str = "{authors}";
        pub const CARGO_PKG_HOMEPAGE: &str = "{homepage}";
        pub const CARGO_PKG_LICENSE_CODE: &str = "{license_code}";
        pub const CARGO_PKG_LICENSE_NAME: &str = "{license_name}";
        pub const CARGO_PKG_LICENSE_URL: &str = "{license_url}";
    "#);

    let metadata_file_path = target_gen_dir.join("metadata.rs");
    fs::write(metadata_file_path, metadata).expect("Failed to write metadata file");

    return Ok(());
}

fn main() {
    println!("cargo:rerun-if-changed=zztools/gen-licenses");
    println!("cargo:rerun-if-changed=Cargo.toml");
    println!("cargo:rerun-if-changed=package.json");
    let root_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));

    let code = Command::new(root_dir.join("zztools").join("gen-licenses")).status();
    if let Err(e) = code {
        eprintln!("Failed to execute gen-licenses: {}", e);
    } else {
        println!("Successfully executed gen-licenses");
    }

    generate_resources(&root_dir).expect("Failed to generate resources");

    tauri_build::build();
}
