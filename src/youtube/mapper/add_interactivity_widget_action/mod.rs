/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::anyhow;
use anyhow::Error;

use crate::events::unichat::UniChatEvent;

mod interactivity_widget_renderer;

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let widget_renderer = value.get("widgetRenderer").ok_or(anyhow!("No item found in value"))?;

    if let Some(value) = widget_renderer.get("interactivityWidgetRenderer") {
        return interactivity_widget_renderer::parse(value.clone());
    }

    return Ok(None);
}

