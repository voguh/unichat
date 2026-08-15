/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;

use crate::utils::base64;
use crate::utils::is_dev;
use crate::utils::path_to_string;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::wm::window;
use crate::UNICHAT_AUTHORS;
use crate::UNICHAT_DESCRIPTION;
use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_HOMEPAGE;
use crate::UNICHAT_ICON_BYTES;
use crate::UNICHAT_LICENSE_CODE;
use crate::UNICHAT_LICENSE_NAME;
use crate::UNICHAT_LICENSE_URL;
use crate::UNICHAT_NAME;
use crate::UNICHAT_VERSION;

pub const MAIN_WINDOW_LABEL: &str = "main";

pub fn create() -> Result<(), Error> {
    let is_dev = is_dev();
    let platform = std::env::consts::OS;

    let unichat_icon = format!("data:image/png;base64,{}", base64::encode(UNICHAT_ICON_BYTES));

    let gallery_dir = path_to_string(&properties::get_app_path(AppPaths::UniChatGallery));
    let license_file = path_to_string(&properties::get_app_path(AppPaths::UniChatLicense));
    let plugins_dir = path_to_string(&properties::get_app_path(AppPaths::UniChatUserPlugins));
    let widgets_dir = path_to_string(&properties::get_app_path(AppPaths::UniChatUserWidgets));

    window::new(MAIN_WINDOW_LABEL, "index.html")
        .title(format!("{} v{}", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION))
        .inner_size(1024.0, 576.0)
        .maximizable(false).resizable(false).center()
        .initialization_script(format!(r#"
            globalThis.__IS_DEV__ = {is_dev};
            globalThis.__PLATFORM__ = "{platform}";

            globalThis.UNICHAT_DISPLAY_NAME = "{UNICHAT_DISPLAY_NAME}";
            globalThis.UNICHAT_NAME = "{UNICHAT_NAME}";
            globalThis.UNICHAT_VERSION = "{UNICHAT_VERSION}";
            globalThis.UNICHAT_DESCRIPTION = "{UNICHAT_DESCRIPTION}";
            globalThis.UNICHAT_AUTHORS = "{UNICHAT_AUTHORS}";
            globalThis.UNICHAT_HOMEPAGE = "{UNICHAT_HOMEPAGE}";
            globalThis.UNICHAT_ICON = "{unichat_icon}";
            globalThis.UNICHAT_LICENSE_CODE = "{UNICHAT_LICENSE_CODE}";
            globalThis.UNICHAT_LICENSE_NAME = "{UNICHAT_LICENSE_NAME}";
            globalThis.UNICHAT_LICENSE_URL = "{UNICHAT_LICENSE_URL}";

            globalThis.UNICHAT_GALLERY_DIR = "{gallery_dir}";
            globalThis.UNICHAT_LICENSE_FILE = "{license_file}";
            globalThis.UNICHAT_PLUGINS_DIR = "{plugins_dir}";
            globalThis.UNICHAT_WIDGETS_DIR = "{widgets_dir}";
        "#)).build()?;

    log::info!("Main window created successfully.");

    return Ok(());
}
