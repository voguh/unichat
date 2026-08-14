/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use serde::Deserialize;
use serde::Serialize;

#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ScraperStatus {
    Idle,
    Ready,
    Ping,
    Error,
    Fatal
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScraperStatusEvent {
    #[serde(rename = "type")]
    pub status: ScraperStatus,

    pub scraper_id: String,
    pub timestamp: i64,

    pub message: Option<String>,
    pub stack: Option<String>,

    #[serde(flatten)]
    pub extra: serde_json::Map<String, serde_json::Value>
}

impl ScraperStatusEvent {
    pub fn extra_str(&self, key: &str) -> Option<&str> {
        return self.extra.get(key).and_then(|value| value.as_str());
    }
}

pub fn parse_status(event_type: &str) -> Option<ScraperStatus> {
    return serde_plain::from_str(event_type).ok();
}
