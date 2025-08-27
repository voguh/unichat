/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

#![allow(clippy::implicit_return)]
#![allow(clippy::needless_return)]
#![allow(clippy::redundant_field_names)]

use std::collections::HashMap;
use std::collections::HashSet;
use std::env;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

use ureq::config::Config;
use ureq::tls::TlsConfig;
use ureq::tls::TlsProvider;

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

    fs::write(metadata_file_path, metadata)?;

    return Ok(());
}

/* ================================================================================================================== */

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct FinalLicenseInfo {
    source: String,
    name: String,
    version: String,
    authors: HashSet<String>,
    repository: String,
    licenses: HashSet<String>
}

fn generate_crate_licenses_info() -> Result<Vec<FinalLicenseInfo>, Box<dyn std::error::Error>> {
    let mut final_licenses: Vec<FinalLicenseInfo> = Vec::new();
    let cargo_bin = env::var("CARGO").unwrap_or_else(|_| "cargo".to_string());

    let metadata = Command::new(&cargo_bin).args(["metadata"]).output()?;
    if !metadata.status.success() {
        return Err(format!("Failed to run metadata: {}", String::from_utf8_lossy(&metadata.stderr)).into());
    }

    let cargo_manifest_json = String::from_utf8(metadata.stdout)?;
    let cargo_manifest: serde_json::Value = serde_json::from_str(&cargo_manifest_json)?;

    let packages = cargo_manifest["packages"].as_array().ok_or("missing packages")?;
    let packages_map: HashMap<String, serde_json::Value> = packages.iter().map(|pkg| {
        return (pkg["name"].as_str().unwrap_or_default().to_string(), pkg.clone());
    }).collect();

    let unichat_package = packages_map["unichat"].clone();
    let unichat_direct_deps = unichat_package["dependencies"].as_array().ok_or("missing dependencies")?;

    for dep in unichat_direct_deps {
        let dep_name = dep["name"].as_str().ok_or("missing dependency.name")?;
        if let Some(kind) = dep["kind"].as_str() {
            if kind == "dev" || kind == "build" {
                continue;
            }
        }

        if let Some(package) = packages_map.get(dep_name) {
            let name = package["name"].as_str().ok_or("missing package.name")?;
            let version = package["version"].as_str().ok_or("missing package.version")?;
            let authors: HashSet<String> = serde_json::from_value(package["authors"].clone())?;
            let repository = format!("https://crates.io/crates/{}/{}", &name, &version);
            let license = package["license"].as_str().ok_or("missing package.license")?;
            let licenses: HashSet<String> = license.split("OR").map(|s| s.trim().to_string()).collect();

            final_licenses.push(FinalLicenseInfo {
                source: String::from("crate"),
                name: String::from(name),
                version: String::from(version),
                authors: authors,
                repository: repository,
                licenses: licenses
            });
        }
    }

    return Ok(final_licenses);
}


fn generate_npm_authors(package: serde_json::Value) -> Result<HashSet<String>, Box<dyn std::error::Error>> {
    let mut authors: HashSet<String> = HashSet::new();

    if let Some(author) = package.get("author") {
        if let Some(author_str) = author.as_str() {
            authors.insert(author_str.to_string());
        } else if let Some(author_obj) = author.as_object() {
            let name = author_obj.get("name").and_then(|v| v.as_str()).ok_or("missing author.name")?;
            let email = author_obj.get("email").and_then(|v| v.as_str()).unwrap_or("");

            if email.is_empty() {
                authors.insert(name.to_string());
            } else {
                authors.insert(format!("{} <{}>", name, email));
            }
        }
    }

    if let Some(contributors) = package["contributors"].as_array() {
        for contributor in contributors {
            if let Some(contributor_str) = contributor.as_str() {
                authors.insert(contributor_str.to_string());
            } else if let Some(contributor_obj) = contributor.as_object() {
                let name = contributor_obj.get("name").and_then(|v| v.as_str()).ok_or("missing author.name")?;
                let email = contributor_obj.get("email").and_then(|v| v.as_str()).unwrap_or("");

                if email.is_empty() {
                    authors.insert(name.to_string());
                } else {
                    authors.insert(format!("{} <{}>", name, email));
                }
            }
        }
    }

    if authors.is_empty() {
        if let Some(maintainers) =package["maintainers"].as_array() {
            for maintainer in maintainers {
                if let Some(contributor_str) = maintainer.as_str() {
                    authors.insert(contributor_str.to_string());
                } else if let Some(contributor_obj) = maintainer.as_object() {
                    let name = contributor_obj.get("name").and_then(|v| v.as_str()).ok_or("missing author.name")?;
                    let email = contributor_obj.get("email").and_then(|v| v.as_str()).unwrap_or("");

                    if email.is_empty() {
                        authors.insert(name.to_string());
                    } else {
                        authors.insert(format!("{} <{}>", name, email));
                    }
                }
            }
        }
    }

    return Ok(authors);
}

fn generate_npm_licenses_info() -> Result<Vec<FinalLicenseInfo>, Box<dyn std::error::Error>> {
    let package_json_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("webapp").join("package.json");
    if !package_json_path.exists() {
        return Err(format!("package.json not found at {}", package_json_path.display()).into());
    }

    let package_json_content = fs::read_to_string(package_json_path)?;
    let package_json: serde_json::Value = serde_json::from_str(&package_json_content)?;
    let dependencies = package_json["dependencies"].as_object().ok_or("missing dependencies")?;

    let mut final_licenses: Vec<FinalLicenseInfo> = Vec::new();

    for (raw_name, raw_version) in dependencies {
        let raw_version = raw_version.as_str().ok_or("dependency version is not a string")?;
        let npm_url = format!("https://registry.npmjs.org/{}/{}", raw_name, raw_version);

        let config = Config::builder()
            .tls_config(
                TlsConfig::builder()
                    .provider(TlsProvider::NativeTls)
                    .root_certs(ureq::tls::RootCerts::PlatformVerifier)
                    .build()
            )
            .build();

        let mut response = config.new_agent().get(npm_url).call()?;
        let package: serde_json::Value = response.body_mut().read_json()?;

        let name = package["name"].as_str().ok_or("missing package.name")?;
        let version = package["version"].as_str().ok_or("missing package.version")?;
        let authors: HashSet<String> = generate_npm_authors(package.clone())?;
        let repository = format!("https://www.npmjs.com/package/{}/v/{}", &name, &version);
        let license = package["license"].as_str().ok_or("missing package.license")?;
        let licenses: HashSet<String> = license.split("OR").map(|s| s.trim().to_string()).collect();

        final_licenses.push(FinalLicenseInfo {
            source: String::from("npm"),
            name: String::from(name),
            version: String::from(version),
            authors: authors,
            repository: repository,
            licenses: licenses
        });
    }


    return Ok(final_licenses);
}

fn generate_third_party_licenses(target_gen_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let licenses_file_path = target_gen_dir.join("third_party_licenses.json");
    if fs::exists(&licenses_file_path)? {
        fs::remove_file(&licenses_file_path)?;
    }

    let mut final_licenses: Vec<FinalLicenseInfo> = Vec::new();

    let crate_licenses = generate_crate_licenses_info()?;
    final_licenses.extend(crate_licenses);

    let npm_licenses = generate_npm_licenses_info()?;
    final_licenses.extend(npm_licenses);

    let final_licenses_json = serde_json::to_string(&final_licenses)?;
    fs::write(licenses_file_path, final_licenses_json)?;

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
            panic!("Failed to create target gen directory: {}", err);
        }
    }

    if let Err(err) = generate_resources(&target_gen_dir) {
        panic!("Failed to generate resources: {}", err);
    }

    if let Err(err) = generate_third_party_licenses(&target_gen_dir) {
        panic!("Failed to generate third party licenses: {}", err);
    }

    tauri_build::build();
}
