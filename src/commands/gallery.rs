/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::path::PathBuf;

use anyhow::Error;
use tauri::AppHandle;
use tauri::Runtime;
use tauri::Url;

use crate::utils::constants::BASE_REST_PORT;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GalleryItem {
    title: String,
    #[serde(rename = "type")]
    item_type: String,
    preview_url: String,
    url: String
}

fn choose_file_type_by_path(path: &PathBuf) -> String {
    let mut item_type = "file";
    if let Some(kind) = mime_guess::from_path(path).first() {
        let mime = kind.essence_str();
        if mime.starts_with("image/") {
            item_type = "image";
        } else if mime.starts_with("video/") {
            item_type = "video";
        } else if mime.starts_with("audio/") {
            item_type = "audio";
        }
    }

    if matches!(item_type, "image" | "video" | "audio") {
        return String::from(item_type);
    }

    return String::from("file");
}

fn get_file_url(file_name: &str) -> Result<Url, Error> {
    let raw_path = format!("/gallery/{}", file_name);
    let segments: Vec<&str> = raw_path.split("/").collect();
    let mut abs = Url::parse(&format!("http://localhost:{}", BASE_REST_PORT))?;
    {
        let mut p = abs.path_segments_mut().map_err(|_| url::ParseError::SetHostOnCannotBeABaseUrl)?;
        p.clear();
        p.extend(segments.iter().cloned());
    }

    return Ok(abs);
}

#[tauri::command]
pub async fn get_gallery_items<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<GalleryItem>, String> {
    let gallery_path = properties::get_app_path(AppPaths::UniChatGallery);

    let mut gallery_items: Vec<GalleryItem> = Vec::new();

    let gallery_read = fs::read_dir(&gallery_path).map_err(|e| format!("An error occurred on read gallery directory: {:#?}", e))?;
    for entry in gallery_read {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() {
                let title = path.file_name().and_then(|n| n.to_str()).ok_or("An error occurred on parse gallery item title")?;
                let item_type = choose_file_type_by_path(&path);

                let file_url = get_file_url(title).map_err(|e| format!("An error occurred on generate gallery item URL: {:#?}", e))?;
                let preview_url = file_url.clone().into();
                let url = file_url.path().into();

                gallery_items.push(GalleryItem {
                    title: String::from(title),
                    item_type: item_type,
                    preview_url: preview_url,
                    url: url
                });
            }
        }
    }

    return Ok(gallery_items);
}

#[tauri::command]
pub async fn upload_gallery_items<R: Runtime>(_app: tauri::AppHandle<R>, files: Vec<String>) -> Result<(), String> {
    let gallery_path = properties::get_app_path(AppPaths::UniChatGallery);
    if !gallery_path.exists() {
        fs::create_dir_all(&gallery_path).map_err(|e| format!("An error occurred on create gallery directory: {:#?}", e))?;
    }

    for file_path_raw in files {
        let file_path = PathBuf::from(&file_path_raw);
        let file_name = file_path.file_name().and_then(|n| n.to_str()).ok_or("An error occurred on parse gallery item title")?;
        let gallery_file_path = gallery_path.join(file_name);
        fs::copy(&file_path, &gallery_file_path).map_err(|e| format!("An error occurred on copy gallery item: {:#?}", e))?;
    }

    return Ok(());
}
