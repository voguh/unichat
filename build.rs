/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

#![allow(clippy::implicit_return)]
#![allow(clippy::needless_return)]
#![allow(clippy::redundant_field_names)]

use std::collections::HashMap;
use std::env;
use std::fs;
use std::hash::DefaultHasher;
use std::hash::Hash;
use std::hash::Hasher as _;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

// I will not implement any api to get license information.
// This is a "safe guard" to remember me to change license info if I change the license.
fn get_license_info(license: &str) -> Result<(String, String), Box<dyn std::error::Error>> {
    let mut licenses: HashMap<&str, (&str, &str)> = HashMap::new();
    licenses.insert("EPL-2.0", ("Eclipse Public License, Version 2.0", "https://www.eclipse.org/legal/epl-2.0/"));

    if let Some((name, url)) = licenses.get(license) {
        return Ok((name.to_string(), url.to_string()));
    } else {
        return Err(format!("Unknown license: {}", license).into());
    }
}

fn generate_resources(target_gen_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let metadata_file_path = target_gen_dir.join("metadata.rs");
    if fs::exists(&metadata_file_path)? {
        fs::remove_file(&metadata_file_path)?;
    }

    let display_name = "UniChat";
    let name = env!("CARGO_PKG_NAME");
    let version = env!("CARGO_PKG_VERSION");
    let description = env!("CARGO_PKG_DESCRIPTION");
    let authors = env!("CARGO_PKG_AUTHORS");
    let homepage = env!("CARGO_PKG_HOMEPAGE");
    let license_code = env!("CARGO_PKG_LICENSE");
    let (license_name, license_url) = get_license_info(license_code)?;

    let metadata = format!(r#"
        pub const UNICHAT_DISPLAY_NAME: &str = "{display_name}";
        pub const UNICHAT_NAME: &str = "{name}";
        pub const UNICHAT_VERSION: &str = "{version}";
        pub const UNICHAT_DESCRIPTION: &str = "{description}";
        pub const UNICHAT_AUTHORS: &str = "{authors}";
        pub const UNICHAT_HOMEPAGE: &str = "{homepage}";
        pub const UNICHAT_LICENSE_CODE: &str = "{license_code}";
        pub const UNICHAT_LICENSE_NAME: &str = "{license_name}";
        pub const UNICHAT_LICENSE_URL: &str = "{license_url}";
    "#);

    fs::write(metadata_file_path, metadata)?;

    return Ok(());
}

/* ================================================================================================================== */

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct FinalLicenseInfo {
    source: String,
    name: String,
    version: String,
    repository: String,
    licenses: String
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct CargoPackage {
    name: String,
    version: String,
    license: String,

    dependencies: Vec<CargoDependency>
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct CargoDependency {
    name: String,
    kind: Option<String>
}

fn generate_crate_licenses_info() -> Result<Vec<FinalLicenseInfo>, Box<dyn std::error::Error>> {
    let mut final_licenses: Vec<FinalLicenseInfo> = Vec::new();

    let cargo_bin = env::var("CARGO_HOME").map(|h| format!("{}/bin/cargo", h)).unwrap_or_else(|_| "cargo".to_string());
    let metadata_output = Command::new(&cargo_bin).args(["metadata", "--format-version", "1"]).output()?;
    if !metadata_output.status.success() {
        return Err(format!("Failed to run metadata: {}", String::from_utf8_lossy(&metadata_output.stderr)).into());
    }

    let cargo_metadata_json = String::from_utf8(metadata_output.stdout)?;
    let cargo_metadata: serde_json::Value = serde_json::from_str(&cargo_metadata_json)?;

    let packages: Vec<CargoPackage> = serde_json::from_value(cargo_metadata["packages"].clone())?;
    let packages_map: HashMap<String, CargoPackage> = packages.into_iter()
        .map(|pkg| (pkg.name.clone(), pkg.clone()))
        .collect();

    // let unichat_direct_deps = unichat_package["dependencies"].as_array().ok_or("missing dependencies")?;

    let unichat_package = packages_map["unichat"].clone();
    for dep in unichat_package.dependencies {
        if matches!(dep.kind.as_deref(), Some("dev") | Some("build")) {
            continue;
        }

        if let Some(package) = packages_map.get(&dep.name) {
            final_licenses.push(FinalLicenseInfo {
                source: String::from("crate"),
                name: package.name.clone(),
                version: package.version.clone(),
                repository: format!("https://crates.io/crates/{}/{}", package.name, package.version),
                licenses: package.license.clone()
            });
        }
    }

    return Ok(final_licenses);
}

/* ========================================================================== */

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct PNPMPackage {
    name: String,
    dependencies: HashMap<String, PNPMDependency>
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct PNPMDependency {
    #[serde(rename = "from")]
    name: String,
    version: String,
    license: String
}

fn generate_npm_licenses_info() -> Result<Vec<FinalLicenseInfo>, Box<dyn std::error::Error>> {
    let mut final_licenses: Vec<FinalLicenseInfo> = Vec::new();

    let webapp_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("webapp");
    let pnpm_bin = env::var("PNPM_HOME").map(|h| format!("{}/pnpm", h)).unwrap_or_else(|_| "pnpm".to_string());
    let metadata_output = Command::new(&pnpm_bin).args(["list", "--json", "--long", "--prod"]).current_dir(&webapp_path).output()?;
    if !metadata_output.status.success() {
        return Err(format!("Failed to run metadata: {}", String::from_utf8_lossy(&metadata_output.stderr)).into());
    }

    let pnpm_metadata_json = String::from_utf8(metadata_output.stdout)?;
    let pnpm_metadata: Vec<PNPMPackage> = serde_json::from_str(&pnpm_metadata_json)?;

    let packages_map: HashMap<String, PNPMPackage> = pnpm_metadata.into_iter()
        .map(|pkg| (pkg.name.clone(), pkg.clone()))
        .collect();

    let unichat_package = packages_map["unichat"].clone();
    for dep in unichat_package.dependencies.values() {
        final_licenses.push(FinalLicenseInfo {
            source: String::from("npm"),
            name: dep.name.clone(),
            version: dep.version.clone(),
            repository: format!("https://www.npmjs.com/package/{}/v/{}", dep.name, dep.version),
            licenses: dep.license.clone()
        });
    }

    return Ok(final_licenses);
}

fn calculate_hash(content: &[u8]) -> u64 {
    let mut hasher = DefaultHasher::new();
    content.hash(&mut hasher);

    return hasher.finish();
}

fn generate_third_party_licenses_lock_hash() -> Result<String, Box<dyn std::error::Error>> {
    let cargo_lock_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("Cargo.lock");
    let pnpm_lock_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("webapp").join("pnpm-lock.yaml");

    let cargo_content = fs::read(&cargo_lock_path)?;
    let pnpm_content = fs::read(&pnpm_lock_path)?;
    let combined_content = [cargo_content, pnpm_content].concat();

    let current_hash = calculate_hash(&combined_content);
    return Ok(current_hash.to_string());
}

fn generate_third_party_licenses(target_gen_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let current_hash = generate_third_party_licenses_lock_hash()?;

    let licenses_file_path = target_gen_dir.join("third_party_licenses.json");
    let licenses_lock_file_path = target_gen_dir.join("third_party_licenses.lock");
    let file_exists = licenses_file_path.exists();
    let lock_exists = licenses_lock_file_path.exists();

    // Remove the licenses file or lock file if only one of them exists, to avoid inconsistency.
    if file_exists != lock_exists {
        if file_exists {
            fs::remove_dir(&licenses_file_path)?;
        } else {
            fs::remove_file(&licenses_lock_file_path)?;
        }
    }

    if lock_exists {
        let existing_hash = fs::read_to_string(&licenses_lock_file_path)?;

        if existing_hash == current_hash {
            return Ok(());
        }
    }

    let mut final_licenses: Vec<FinalLicenseInfo> = Vec::new();

    let crate_licenses = generate_crate_licenses_info()?;
    final_licenses.extend(crate_licenses);

    let npm_licenses = generate_npm_licenses_info()?;
    final_licenses.extend(npm_licenses);

    let final_licenses_json = serde_json::to_string(&final_licenses)?;
    fs::write(licenses_file_path, final_licenses_json)?;
    fs::write(licenses_lock_file_path, current_hash)?;

    return Ok(());
}

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=Cargo.toml");
    println!("cargo:rerun-if-changed=webapp/package.json");
    let root_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let target_gen_dir = root_dir.join("target").join("gen");

    if !target_gen_dir.exists() {
        if let Err(err) = fs::create_dir_all(&target_gen_dir) {
            panic!("Failed to create target gen directory: {:?}", err);
        }
    }

    if let Err(err) = generate_resources(&target_gen_dir) {
        panic!("Failed to generate resources: {:?}", err);
    }

    if let Err(err) = generate_third_party_licenses(&target_gen_dir) {
        panic!("Failed to generate third party licenses: {:?}", err);
    }

    tauri_build::build();
}
