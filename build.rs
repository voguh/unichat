/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

// I will not implement any api to get license information.
// This is a "safe guard" to remember me to change license info if I change the license.
fn get_license_info(license: &str) -> Result<(String, String), Box<dyn std::error::Error>> {
    let mut licenses: HashMap<&str, (&str, &str)> = HashMap::new();
    licenses.insert("LGPL-3.0-only", ("GNU Lesser General Public License, Version 3", "https://www.gnu.org/licenses/lgpl-3.0.html"));

    if let Some((name, url)) = licenses.get(license) {
        return Ok((name.to_string(), url.to_string()));
    } else {
        return Err(format!("Unknown license: {}", license).into());
    }
}

fn generate_resources(root_dir: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let target_gen_dir = root_dir.join("target").join("gen");

    let display_name = "UniChat";
    let name = env!("CARGO_PKG_NAME");
    let version = env!("CARGO_PKG_VERSION");
    let description = env!("CARGO_PKG_DESCRIPTION");
    let authors = env!("CARGO_PKG_AUTHORS");
    let homepage = env!("CARGO_PKG_HOMEPAGE");
    let license_code = env!("CARGO_PKG_LICENSE");
    let (license_name, license_url) = get_license_info(&license_code)?;

    if !target_gen_dir.exists() {
        fs::create_dir_all(&target_gen_dir)?;
    }

    let metadata = format!(r#"
        pub const CARGO_PKG_DISPLAY_NAME: &'static str = "{display_name}";
        pub const CARGO_PKG_NAME: &'static str = "{name}";
        pub const CARGO_PKG_VERSION: &'static str = "{version}";
        pub const CARGO_PKG_DESCRIPTION: &'static str = "{description}";
        pub const CARGO_PKG_AUTHORS: &'static str = "{authors}";
        pub const CARGO_PKG_HOMEPAGE: &'static str = "{homepage}";
        pub const CARGO_PKG_LICENSE_CODE: &'static str = "{license_code}";
        pub const CARGO_PKG_LICENSE_NAME: &'static str = "{license_name}";
        pub const CARGO_PKG_LICENSE_URL: &'static str = "{license_url}";
    "#);

    let metadata_file_path = target_gen_dir.join("metadata.rs");
    fs::write(metadata_file_path, metadata).expect("Failed to write metadata file");

    return Ok(());
}

fn main() {
    let root_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));

    generate_resources(&root_dir).expect("Failed to generate resources");

    tauri_build::build();
}
