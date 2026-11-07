/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::Error;
use anyhow::anyhow;
use serde::Deserialize;
use serde::Serialize;

/* ========================================================================== */

#[derive(Deserialize)]
struct RawIRCCommand {
    name: String,
    params: Vec<String>
}

#[derive(Deserialize)]
struct RawIRCMessage {
    raw: String,
    tags: HashMap<String, Option<String>>,
    prefix: Vec<String>,
    command: RawIRCCommand
}

/* ========================================================================== */

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(try_from = "RawIRCMessage")]
pub struct IRCMessage {
    pub raw: String,
    pub tags: HashMap<String, Option<String>>,
    pub prefix: Option<IRCPrefix>,
    pub command: IRCCommand
}

#[derive(Serialize, Clone, Debug)]
pub enum IRCPrefix {
    Server(String),
    Nick(String, String, String)
}

#[derive(Serialize, Clone, Debug)]
pub enum IRCCommand {
    Privmsg(String, String),
    Raw(String, Vec<String>)
}

fn parse_prefix(prefix: &[String]) -> Result<Option<IRCPrefix>, Error> {
    return match prefix {
        [] => Ok(None),
        [server] => Ok(Some(IRCPrefix::Server(server.clone()))),
        [nick, user, host] => Ok(Some(IRCPrefix::Nick(nick.clone(), user.clone(), host.clone()))),
        _ => Err(anyhow!("Invalid IRC prefix '{:?}'", prefix))
    };
}

fn parse_command(command: RawIRCCommand) -> IRCCommand {
    if command.name == "PRIVMSG" && command.params.len() == 2 {
        return IRCCommand::Privmsg(command.params[0].clone(), command.params[1].clone());
    }

    return IRCCommand::Raw(command.name, command.params);
}

impl TryFrom<RawIRCMessage> for IRCMessage {
    type Error = Error;

    fn try_from(value: RawIRCMessage) -> Result<Self, Self::Error> {
        let prefix = parse_prefix(&value.prefix)?;
        let command = parse_command(value.command);

        return Ok(IRCMessage { raw: value.raw, tags: value.tags, prefix: prefix, command: command });
    }
}
