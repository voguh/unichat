# UniChat Auxiliary Modules

### Table of Contents
- [UniChat JSON Module](#unichat-json-module)
- [UniChat Logger Module](#unichat-logger-module)
- [UniChat String Module](#unichat-string-module)
- [UniChat Time Module](#unichat-time-module)
- [UniChat Yaml Module](#unichat-yaml-module)
- [UniChatPlatform Global](#unichatplatform)
- [UniChatAuthorType Global](#unichatauthortype)
- [UniChatEvent Global](#unichatevent)
- [UniChatEmote Global](#unichatemote)
- [UniChatBadge Global](#unichatbadge)

---

## UniChat JSON Module

The **UniChat** JSON module is available via `require` as `unichat:json`.

Usage example:
```lua
local json = require("unichat:json");

local data = {
    name = "UniChat",
    version = "1.0.0"
};

local json_string = json:encode(data);
print(json_string);  -- Output: {"name":"UniChat","version":"1.0.0"}

local decoded_data = json:decode(json_string);
print(decoded_data.name);  -- Output: UniChat
```

#### Functions

- `json:encode(table)`: Encodes a Lua table into a JSON string.
  | Argument | Type    | Required | Description              |
  |----------|---------|----------|--------------------------|
  | table    | `table` | YES      | Lua table to be encoded. |

- `json:decode(string)`: Decodes a JSON string into a Lua table.
  | Argument | Type     | Required | Description                |
  |----------|----------|----------|----------------------------|
  | string   | `string` | YES      | JSON string to be decoded. |

---

## UniChat Logger Module

The **UniChat** Logger module is available via `require` as `unichat:logger`.

It uses parameterized logging similar to Java’s `slf4j`.
Each argument replaces `{}` in the message in the order passed.
If the last argument is an error, it is logged as a stacktrace and is not used for substitution.

Usage example:
```lua
local logger = require("unichat:logger");

logger:info("This is an info message from my plugin.");
logger:warn("This is a warning message from my plugin.");
logger:info("This message was emitted from {}", __PLUGIN_NAME);
```

#### Functions

- `logger:debug(template, ...)`: Logs a debug message.
  | Argument | Type     | Required | Description                                                           |
  |----------|----------|----------|-----------------------------------------------------------------------|
  | template | `string` | YES      | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...      | `any`    | NO       | Arguments to replace the placeholders in the message.                 |

- `logger:info(template, ...)`: Logs an info message.
  | Argument | Type     | Required | Description                                                           |
  |----------|----------|----------|-----------------------------------------------------------------------|
  | template | `string` | YES      | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...      | `any`    | NO       | Arguments to replace the placeholders in the message.                 |

- `logger:warn(template, ...)`: Logs a warning message.
  | Argument | Type     | Required | Description                                                           |
  |----------|----------|----------|-----------------------------------------------------------------------|
  | template | `string` | YES      | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...      | `any`    | NO       | Arguments to replace the placeholders in the message.                 |

- `logger:error(template, ...)`: Logs an error message.
  | Argument | Type     | Required | Description                                                           |
  |----------|----------|----------|-----------------------------------------------------------------------|
  | template | `string` | YES      | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...      | `any`    | NO       | Arguments to replace the placeholders in the message.                 |

---

## UniChat String Module

The **UniChat** String module is available via `require` as `unichat:string`.
This module provides utility functions for string manipulation.

#### Functions
- `string:to_upper(str)`: Returns the string converted to uppercase.
  | Argument | Type     | Required | Description                          |
  |----------|----------|----------|--------------------------------------|
  | str      | `string` | YES      | String to be converted to uppercase. |

- `string:to_lower(str)`: Returns the string converted to lowercase.
  | Argument | Type     | Required | Description                          |
  |----------|----------|----------|--------------------------------------|
  | str      | `string` | YES      | String to be converted to lowercase. |

- `string:strip_prefix(str, prefix)`: Returns the string without the prefix if it exists, otherwise returns `nil`.
  | Argument | Type     | Required | Description                                   |
  |----------|----------|----------|-----------------------------------------------|
  | str      | `string` | YES      | String from which the prefix will be removed. |
  | prefix   | `string` | YES      | Prefix to be removed from the string.         |

- `string:strip_suffix(str, suffix)`: Returns the string without the suffix if it exists, otherwise returns `nil`.
  | Argument | Type     | Required | Description                                   |
  |----------|----------|----------|-----------------------------------------------|
  | str      | `string` | YES      | String from which the suffix will be removed. |
  | suffix   | `string` | YES      | Suffix to be removed from the string.         |

- `string:starts_with(str, prefix)`: Returns a `boolean` indicating whether the string starts with the prefix.
  | Argument | Type     | Required | Description           |
  |----------|----------|----------|-----------------------|
  | str      | `string` | YES      | String to be checked. |
  | prefix   | `string` | YES      | Prefix to be checked. |

- `string:ends_with(str, suffix)`: Returns a `boolean` indicating whether the string ends with the suffix.
  | Argument | Type     | Required | Description           |
  |----------|----------|----------|-----------------------|
  | str      | `string` | YES      | String to be checked. |
  | suffix   | `string` | YES      | Suffix to be checked. |

- `string:find(str, substring)`: Returns the `1-based` index of the first occurrence of the substring in the string, or `nil` if not found.
  | Argument  | Type     | Required | Description                          |
  |-----------|----------|----------|--------------------------------------|
  | str       | `string` | YES      | String to be searched.               |
  | substring | `string` | YES      | Substring to be found in the string. |

- `string:rfind(str, substring): number`: Returns the `1-based` index of the last occurrence of the substring in the string, or `nil` if not found.
  | Argument  | Type     | Required | Description                          |
  |-----------|----------|----------|--------------------------------------|
  | str       | `string` | YES      | String to be searched.               |
  | substring | `string` | YES      | Substring to be found in the string. |

- `string:is_empty(str)`: Returns a `boolean` indicating whether the string is empty.
  | Argument | Type     | Required | Description           |
  |----------|----------|----------|-----------------------|
  | str      | `string` | YES      | String to be checked. |

- `string:trim(str)`: Returns the string with whitespace removed from the start and end.
  | Argument | Type     | Required | Description           |
  |----------|----------|----------|-----------------------|
  | str      | `string` | YES      | String to be trimmed. |

- `string:trim_start(str)`: Returns the string with whitespace removed from the start.
  | Argument | Type     | Required | Description           |
  |----------|----------|----------|-----------------------|
  | str      | `string` | YES      | String to be trimmed. |

- `string:trim_end(str)`: Returns the string with whitespace removed from the end.
  | Argument | Type     | Required | Description           |
  |----------|----------|----------|-----------------------|
  | str      | `string` | YES      | String to be trimmed. |

- `string:to_bytes(str)`: Returns a `number[]` table of bytes representing the string.
  | Argument | Type     | Required | Description             |
  |----------|----------|----------|-------------------------|
  | str      | `string` | YES      | String to be converted. |

- `string:from_bytes(bytes)`: Returns a UTF-8 string built from a `number[]` byte table.
  | Argument | Type       | Required | Description                 |
  |----------|------------|----------|-----------------------------|
  | bytes    | `number[]` | YES      | Byte table to be converted. |

- `string:chars(str)`: Returns a `string[]` table containing each character of the string.
  | Argument | Type     | Required | Description         |
  |----------|----------|----------|---------------------|
  | str      | `string` | YES      | String to be split. |

- `string:length(str)`: Returns the length (number of characters) of the string.
  | Argument | Type     | Required | Description            |
  |----------|----------|----------|------------------------|
  | str      | `string` | YES      | String to be measured. |

- `string:replace(str, from, to, count)`: Returns the string with occurrences of `from` replaced by `to`. The number of replacements is limited by `count` (if provided).
  | Argument | Type     | Required | Description                                     |
  |----------|----------|----------|-------------------------------------------------|
  | str      | `string` | YES      | String to be modified.                          |
  | from     | `string` | YES      | Substring to be replaced.                       |
  | to       | `string` | YES      | Substring that replaces the original substring. |
  | count    | `number` | NO       | Maximum number of replacements to perform.      |

- `string:contains(str, substring)`: Returns a `boolean` indicating whether the string contains the substring.
  | Argument  | Type     | Required | Description                      |
  |-----------|----------|----------|----------------------------------|
  | str       | `string` | YES      | String to be checked.            |
  | substring | `string` | YES      | Substring to look for in string. |

- `string:split(str, delimiter)`: Returns a `string[]` table containing the parts of the string split by the delimiter.
  | Argument  | Type     | Required | Description                         |
  |-----------|----------|----------|-------------------------------------|
  | str       | `string` | YES      | String to be split.                 |
  | delimiter | `string` | YES      | Delimiter used to split the string. |

---

## UniChat Time Module

The **UniChat** Time module is available via `require` as `unichat:time`.
This module provides utility functions for handling time and dates.

Usage example:
```lua
local time = require("unichat:time");

local current_timestamp = time:now();
print("Current Timestamp (ms since Unix epoch):", current_timestamp);
```

#### Functions
- `time:now()`: Returns the current timestamp in milliseconds since the Unix epoch (January 1, 1970).

---

## UniChat Yaml Module

The **UniChat** Yaml module is available via `require` as `unichat:yaml`.
This module provides functions for encoding and decoding YAML data.

Usage example:
```lua
local yaml = require("unichat:yaml");

local data = {
    name = "UniChat",
    version = "1.0.0"
};

local yaml_string = yaml:encode(data);
print(yaml_string);
-- Output:
-- name: UniChat
-- version: 1.0.0

local decoded_data = yaml:decode(yaml_string);
print(decoded_data.name);  -- Output: UniChat
```

#### Functions
- `yaml:encode(table)`: Encodes a Lua table into a YAML string.
  | Argument | Type    | Required | Description              |
  |----------|---------|----------|--------------------------|
  | table    | `table` | YES      | Lua table to be encoded. |

- `yaml:decode(string)`: Decodes a YAML string into a Lua table.
  | Argument | Type     | Required | Description                |
  |----------|----------|----------|----------------------------|
  | string   | `string` | YES      | YAML string to be decoded. |

---

## UniChatPlatform

This is a global available as `UniChatPlatform`.
It is a factory to fill in the platform name.

Usage example:
```lua
local platform = UniChatPlatform:Twitch();
print(platform);  -- Output: twitch

local platform2 = UniChatPlatform:YouTube();
print(platform2);  -- Output: youtube

local platform3 = UniChatPlatform:Other("KiCk");
print(platform3);  -- Output: kick
```

#### Functions
- `UniChatPlatform:Twitch()`: Returns a `string` with the value `twitch`.
- `UniChatPlatform:YouTube()`: Returns a `string` with the value `youtube`.
- `UniChatPlatform:Other(name)`: Returns a `string` with the value of `name` normalized to lowercase.

---

## UniChatAuthorType

This is a global available as `UniChatAuthorType`.
It is a factory to fill in the user type.

Usage example:
```lua
local type1 = UniChatAuthorType:Viewer();
print(type1);  -- Output: VIEWER

local type2 = UniChatAuthorType:Broadcaster();
print(type2);  -- Output: BROADCASTER

local type3 = UniChatAuthorType:Other("mycustomtype");
print(type3);  -- Output: MYCUSTOMTYPE
```

#### Functions
- `UniChatAuthorType:Viewer()`: Returns a `string` with the value `VIEWER`.
- `UniChatAuthorType:Sponsor()`: Returns a `string` with the value `SPONSOR`.
- `UniChatAuthorType:Vip()`: Returns a `string` with the value `VIP`.
- `UniChatAuthorType:Moderator()`: Returns a `string` with the value `MODERATOR`.
- `UniChatAuthorType:Broadcaster()`: Returns a `string` with the value `BROADCASTER`.
- `UniChatAuthorType:Other(name)`: Returns a `string` with the value of `name` normalized to uppercase.

---

## UniChatEvent

This is a global available as `UniChatEvent`.
It is a factory to create events.

Usage example:
```lua
local event = UniChatEvent:Message({
  -- event data
});
```

#### Functions
- `UniChatEvent:Clear(data)`: Returns a `userdata` representing the [`unichat:clear`](/widgets/events?id=unichatclear) event.
- `UniChatEvent:RemoveMessage(data)`: Returns a `userdata` representing the [`unichat:removemessage`](/widgets/events?id=unichatremovemessage) event.
- `UniChatEvent:RemoveAuthor(data)`: Returns a `userdata` representing the [`unichat:removeauthor`](/widgets/events?id=unichatremoveauthor) event.
- `UniChatEvent:Message(data)`: Returns a `userdata` representing the [`unichat:message`](/widgets/events?id=unichatmessage) event.
- `UniChatEvent:Donate(data)`: Returns a `userdata` representing the [`unichat:donate`](/widgets/events?id=unichatdonate) event.
- `UniChatEvent:Sponsor(data)`: Returns a `userdata` representing the [`unichat:sponsor`](/widgets/events?id=unichatsponsor) event.
- `UniChatEvent:SponsorGift(data)`: Returns a `userdata` representing the [`unichat:sponsor_gift`](/widgets/events?id=unichatsponsor_gift) event.
- `UniChatEvent:Raid(data)`: Returns a `userdata` representing the [`unichat:raid`](/widgets/events?id=unichatraid) event.
- `UniChatEvent:Redemption(data)`: Returns a `userdata` representing the [`unichat:redemption`](/widgets/events?id=unichatredemption) event.
- `UniChatEvent:Custom(data)`: Returns a `userdata` representing a custom event (`unichat:custom`).

!> All functions accept a `data` table that must follow the pattern of the respective event.

---

## UniChatEmote

This is a global available as `UniChatEmote`.
It is a factory to create emotes.

Usage example:
```lua
local emote = UniChatEmote:new(id, name, url);
```

#### Functions
- `UniChatEmote:new(id, name, url)`: Returns a table following the [`UniChatEmote`](/widgets/events?id=unichatemote) pattern.
  | Argument | Type     | Required | Description            |
  |----------|----------|----------|------------------------|
  | id       | `string` | YES      | Emote ID.              |
  | name     | `string` | YES      | Emote name.            |
  | url      | `string` | YES      | Emote image URL.       |

!> The returned table is immutable (read-only).

---

## UniChatBadge

This is a global available as `UniChatBadge`.
It is a factory to create badges.

Usage example:
```lua
local badge = UniChatBadge:new(code, url);
```

#### Functions
- `UniChatBadge:new(code, url)`: Returns a table following the [`UniChatBadge`](/widgets/events?id=unichatbadge) pattern.
  | Argument | Type     | Required | Description            |
  |----------|----------|----------|------------------------|
  | code     | `string` | YES      | Badge code.            |
  | url      | `string` | YES      | Badge image URL.       |

!> The returned table is immutable (read-only).
