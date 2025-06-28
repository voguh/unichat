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

pub mod constants;
pub mod properties;
pub mod settings;

pub fn is_dev() -> bool {
    return cfg!(debug_assertions) || tauri::is_dev();
}

pub fn parse_serde_error(error: serde_json::Error) -> Box<dyn std::error::Error> {
    return Box::new(error);
}

pub fn normalize_value(value_raw: &str) -> Result<f32, Box<dyn std::error::Error>> {
    let last_dot = value_raw.rfind('.');
    let last_comma = value_raw.rfind(',');
    let normalized = match(last_dot, last_comma) {
        (Some(dot_index), Some(comma_index)) => {
            if dot_index > comma_index {
                value_raw.replace(",", "")
            } else {
                value_raw.replace(".", "").replace(",", ".")
            }
        }
        (Some(dot_index), None) => {
            let digits_after_dot = value_raw.len() - dot_index - 1;
            if value_raw.matches(".").count() == 1 && digits_after_dot <= 2 {
                value_raw.to_string()
            } else {
                value_raw.replace(".", "")
            }
        }
        (None, Some(comma_index)) => {
            let digits_after_comma = value_raw.len() - comma_index -1;
            if value_raw.matches(",").count() == 1 && digits_after_comma <= 2 {
                value_raw.replace(",", ".")
            } else {
                value_raw.replace(",", "")
            }
        },
        (None, None) => value_raw.to_string()
    };

    return normalized.parse().map_err(|e| Box::new(e) as Box<dyn std::error::Error>);
}
