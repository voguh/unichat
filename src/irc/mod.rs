/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::anyhow;
use anyhow::Error;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct IRCMessage {
    pub raw: String,
    pub tags: HashMap<String, Option<String>>,
    pub prefix: Option<IRCPrefix>,
    pub command: IRCCommand
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub enum IRCPrefix {
    Server(String),
    Nick(String, String, String)
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub enum IRCCommand {
    /// PRIVMSG chatroom :message
    PRIVMSG(String, String),
    /// A raw IRC command unknown to the crate.
    Raw(String, Vec<String>),
}


impl IRCMessage {
    pub fn parse(value: Option<&serde_json::Value>) -> Result<Self, Error> {
        if let Some(value) = value {
            let raw = value.get("raw").and_then(|r| r.as_str()).ok_or(anyhow!("Missing raw IRC message"))?;
            let tags = Self::parse_tags(value.get("tags"))?;
            let prefix = Self::parse_prefix(value.get("prefix"))?;
            let command = Self::parse_command(value.get("command"))?;

            return Ok(IRCMessage {
                raw: raw.to_string(),
                tags: tags,
                prefix: prefix,
                command: command
            });
        } else {
            return Err(anyhow!("Missing IRC message value"));
        }
    }

    fn parse_tags(tags_obj: Option<&serde_json::Value>) -> Result<HashMap<String, Option<String>>, Error> {
        let mut tags = HashMap::new();

        if let Some(tags_obj) = tags_obj.and_then(|tags| tags.as_object()) {
            for (key, value) in tags_obj {
                let value_str = value.as_str().map(|s| s.to_string());
                tags.insert(key.to_string(), value_str);
            }
        }

        return Ok(tags);
    }

    fn parse_prefix(prefix_arr: Option<&serde_json::Value>) -> Result<Option<IRCPrefix>, Error> {
        if let Some(prefix_arr) = prefix_arr.and_then(|prefix| prefix.as_array()) {
            if prefix_arr.len() == 0 {
                return Ok(None);
            } else if prefix_arr.len() == 1 {
                let server_name = prefix_arr[0].as_str().ok_or(anyhow!("Invalid server name in prefix"))?;
                return Ok(Some(IRCPrefix::Server(server_name.to_string())));
            } else if prefix_arr.len() == 3 {
                let nick = prefix_arr[0].as_str().ok_or(anyhow!("Invalid nickname in prefix"))?;
                let user = prefix_arr[1].as_str().ok_or(anyhow!("Invalid user in prefix"))?;
                let host = prefix_arr[2].as_str().ok_or(anyhow!("Invalid host in prefix"))?;
                return Ok(Some(IRCPrefix::Nick(nick.to_string(), user.to_string(), host.to_string())));
            }
        }

        return Err(anyhow!("Invalid prefix array length"));
    }

    fn parse_command(command_obj: Option<&serde_json::Value>) -> Result<IRCCommand, Error> {
        if let Some(command_obj) = command_obj.and_then(|cmd| cmd.as_object()) {
            let name = command_obj.get("name").and_then(|n| n.as_str()).ok_or(anyhow!("Invalid command name"))?;
            let params = command_obj.get("params").and_then(|params| params.as_array()).ok_or(anyhow!("Invalid command params"))?;
            let params_str: Vec<String> = params.iter().filter_map(|p| p.as_str().map(|s| s.to_string())).collect();

            if name == "PRIVMSG" && params_str.len() == 2 {
                return Ok(IRCCommand::PRIVMSG(params_str[0].clone(), params_str[1].clone()));
            }

            return Ok(IRCCommand::Raw(name.to_string(), params_str));
        }

        return Err(anyhow!("Invalid command object"));
    }
}
