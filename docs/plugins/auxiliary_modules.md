# Auxiliary Modules

Auxiliary modules are built-in libraries provided by **UniChat** to assist plugin developers with common tasks.
These modules can be accessed by using the `require` function in Lua.

---

## Module `unichat:http`

The **UniChat** HTTP module is available via `require` as `unichat:http`.

Usage example:
```lua
local http = require("unichat:http");

local response = http:get("https://api.example.com/data");
print("Response Status Code:", response.status_code);

if response.ok then
    local json = response:json(); -- table
    print("Response Data:", json);

    local json = response:text(); -- string
    print("Response Text:", json);
end
```

#### Functions

- `http:get(url, args)`: Sends a GET request to the specified URL and returns [`UniChatHttpResponse`](#unichathttpresponse).
  | Argument | Type               | Description                                                                                      |
  |----------|--------------------|--------------------------------------------------------------------------------------------------|
  | `url`    | `string`           | The URL to send the GET request to.                                                              |
  | `args`   | `UniChatHttpArgs?` | Optional table of additional options.<br/>See [`UniChatHttpArgs`](#unichathttpargs) for details. |

- `http:post(url, body, args)`: Sends a POST request to the specified URL with the given body and returns [`UniChatHttpResponse`](#unichathttpresponse).
  | Argument | Type                         | Description                                                                                      |
  |----------|------------------------------|--------------------------------------------------------------------------------------------------|
  | `url`    | `string`                     | The URL to send the POST request to.                                                             |
  | `body`   | `string` \| `table` \| `nil` | The body of the POST request.                                                                    |
  | `args`   | `UniChatHttpArgs?`           | Optional table of additional options.<br/>See [`UniChatHttpArgs`](#unichathttpargs) for details. |

- `http:put(url, body, args)`: Sends a PUT request to the specified URL with the given body and returns [`UniChatHttpResponse`](#unichathttpresponse).
  | Argument | Type                         | Description                                                                                      |
  |----------|------------------------------|--------------------------------------------------------------------------------------------------|
  | `url`    | `string`                     | The URL to send the PUT request to.                                                              |
  | `body`   | `string` \| `table` \| `nil` | The body of the PUT request.                                                                     |
  | `args`   | `UniChatHttpArgs?`           | Optional table of additional options.<br/>See [`UniChatHttpArgs`](#unichathttpargs) for details. |

- `http:path(url, body, args)`: Sends a PATCH request to the specified URL with the given body and returns [`UniChatHttpResponse`](#unichathttpresponse).
  | Argument | Type                         | Description                                                                                      |
  |----------|------------------------------|--------------------------------------------------------------------------------------------------|
  | `url`    | `string`                     | The URL to send the PATCH request to.                                                            |
  | `body`   | `string` \| `table` \| `nil` | The body of the PATCH request.                                                                   |
  | `args`   | `UniChatHttpArgs?`           | Optional table of additional options.<br/>See [`UniChatHttpArgs`](#unichathttpargs) for details. |

- `http:delete(url, args)`: Sends a DELETE request to the specified URL and returns [`UniChatHttpResponse`](#unichathttpresponse).
  | Argument | Type               | Description                                                                                      |
  |----------|--------------------|--------------------------------------------------------------------------------------------------|
  | `url`    | `string`           | The URL to send the DELETE request to.                                                           |
  | `args`   | `UniChatHttpArgs?` | Optional table of additional options.<br/>See [`UniChatHttpArgs`](#unichathttpargs) for details. |

- `http:head(url, args)`: Sends a HEAD request to the specified URL and returns [`UniChatHttpResponse`](#unichathttpresponse).
  | Argument | Type               | Description                                                                                      |
  |----------|--------------------|--------------------------------------------------------------------------------------------------|
  | `url`    | `string`           | The URL to send the HEAD request to.                                                             |
  | `args`   | `UniChatHttpArgs?` | Optional table of additional options.<br/>See [`UniChatHttpArgs`](#unichathttpargs) for details. |

#### UniChatHttpArgs

A table of optional arguments for HTTP requests.

| Field          | Type      | Description                                                                                              |
|----------------|-----------|----------------------------------------------------------------------------------------------------------|
| `headers`      | `table?`  | A table of headers to include in the request. Keys and values should be strings.                         |
| `query_params` | `table?`  | A table of query parameters to append to the URL. Keys and values should be strings.                     |
| `content_type` | `string?` | The content type of the request body (e.g., "application/json"). It's an alias to header `Content-Type`. |
| `basic_auth`   | `table?`  | A table with `username` and `password` fields for basic authentication.                                  |

#### UniChatHttpResponse

An userdata object representing the response from an HTTP request.

| Field         | Type      | Description                                                    |
|---------------|-----------|----------------------------------------------------------------|
| `ok`          | `boolean` | Indicates if the request was successful (status code 200-299). |
| `status_code` | `number`  | The HTTP status code of the response.                          |
| `status_text` | `string`  | The status text of the response.                               |
| `headers`     | `table`   | A table of response headers.                                   |
| `url`         | `string`  | The final URL of the response (after redirects).               |

| Functions               | Arguments      | Return Type       | Description                                                                |
|-------------------------|----------------|-------------------|----------------------------------------------------------------------------|
| `response:header(name)` | `name: string` | `string` \| `nil` | Returns the value of the specified response header, or `nil` if not found. |
| `response:text()`       | ---            | `string`          | Returns the response body as a string.                                     |
| `response:json()`       | ---            | `table`           | Parses the response body as JSON and returns it as a Lua table.            |
| `response:bytes()`      | ---            | `table`           | Returns the response body as a byte array.                                 |

---

## Moduloe `unichat:json`

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
  | Argument | Type    | Description              |
  |----------|---------|--------------------------|
  | `table`  | `table` | Lua table to be encoded. |

- `json:decode(string)`: Decodes a JSON string into a Lua table.
  | Argument | Type     | Description                |
  |----------|----------|----------------------------|
  | `str`    | `string` | JSON string to be decoded. |

---

## Module `unichat:logger`

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
  | Argument   | Type     | Description                                                           |
  |------------|----------|-----------------------------------------------------------------------|
  | `template` | `string` | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...        | `any`    | Arguments to replace the placeholders in the message.                 |

- `logger:info(template, ...)`: Logs an info message.
  | Argument   | Type     | Description                                                           |
  |------------|----------|-----------------------------------------------------------------------|
  | `template` | `string` | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...        | `any`    | Arguments to replace the placeholders in the message.                 |

- `logger:warn(template, ...)`: Logs a warning message.
  | Argument   | Type     | Description                                                           |
  |------------|----------|-----------------------------------------------------------------------|
  | `template` | `string` | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...        | `any`    | Arguments to replace the placeholders in the message.                 |

- `logger:error(template, ...)`: Logs an error message.
  | Argument   | Type     | Description                                                           |
  |------------|----------|-----------------------------------------------------------------------|
  | `template` | `string` | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...        | `any`    | Arguments to replace the placeholders in the message.                 |

---

## Module `unichat:string`

The **UniChat** String module is available via `require` as `unichat:string`.
This module provides utility functions for string manipulation.

#### Functions
- `string:to_upper(str)`: Returns the string converted to uppercase.
  | Argument | Type     | Description                          |
  |----------|----------|--------------------------------------|
  | `str`    | `string` | String to be converted to uppercase. |

- `string:to_lower(str)`: Returns the string converted to lowercase.
  | Argument | Type     | Description                          |
  |----------|----------|--------------------------------------|
  | `str`    | `string` | String to be converted to lowercase. |

- `string:strip_prefix(str, prefix)`: Returns the string without the prefix if it exists, otherwise returns `nil`.
  | Argument | Type     | Description                                   |
  |----------|----------|-----------------------------------------------|
  | `str`    | `string` | String from which the prefix will be removed. |
  | `prefix` | `string` | Prefix to be removed from the string.         |

- `string:strip_suffix(str, suffix)`: Returns the string without the suffix if it exists, otherwise returns `nil`.
  | Argument | Type     | Description                                   |
  |----------|----------|-----------------------------------------------|
  | `str`    | `string` | String from which the suffix will be removed. |
  | `suffix` | `string` | Suffix to be removed from the string.         |

- `string:starts_with(str, prefix)`: Returns a `boolean` indicating whether the string starts with the prefix.
  | Argument | Type     | Description           |
  |----------|----------|-----------------------|
  | `str`    | `string` | String to be checked. |
  | `prefix` | `string` | Prefix to be checked. |

- `string:ends_with(str, suffix)`: Returns a `boolean` indicating whether the string ends with the suffix.
  | Argument | Type     | Description           |
  |----------|----------|-----------------------|
  | `str`    | `string` | String to be checked. |
  | `suffix` | `string` | Suffix to be checked. |

- `string:find(str, substring)`: Returns the `1-based` index of the first occurrence of the substring in the string, or `nil` if not found.
  | Argument    | Type     | Description                          |
  |-------------|----------|--------------------------------------|
  | `str`       | `string` | String to be searched.               |
  | `substring` | `string` | Substring to be found in the string. |

- `string:rfind(str, substring): number`: Returns the `1-based` index of the last occurrence of the substring in the string, or `nil` if not found.
  | Argument    | Type     | Description                          |
  |-------------|----------|--------------------------------------|
  | `str`       | `string` | String to be searched.               |
  | `substring` | `string` | Substring to be found in the string. |

- `string:is_empty(str)`: Returns a `boolean` indicating whether the string is empty.
  | Argument | Type     | Description           |
  |----------|----------|-----------------------|
  | `str`    | `string` | String to be checked. |

- `string:trim(str)`: Returns the string with whitespace removed from the start and end.
  | Argument | Type     | Description           |
  |----------|----------|-----------------------|
  | `str`    | `string` | String to be trimmed. |

- `string:trim_start(str)`: Returns the string with whitespace removed from the start.
  | Argument | Type     | Description           |
  |----------|----------|-----------------------|
  | `str`    | `string` | String to be trimmed. |

- `string:trim_end(str)`: Returns the string with whitespace removed from the end.
  | Argument | Type     | Description           |
  |----------|----------|-----------------------|
  | `str`    | `string` | String to be trimmed. |

- `string:to_bytes(str)`: Returns a `number[]` table of bytes representing the string.
  | Argument | Type     | Description             |
  |----------|----------|-------------------------|
  | `str`    | `string` | String to be converted. |

- `string:from_bytes(bytes)`: Returns a UTF-8 string built from a `number[]` byte table.
  | Argument | Type       | Description                 |
  |----------|------------|-----------------------------|
  | `bytes`  | `number[]` | Byte table to be converted. |

- `string:chars(str)`: Returns a `string[]` table containing each character of the string.
  | Argument | Type     | Description         |
  |----------|----------|---------------------|
  | `str`    | `string` | String to be split. |

- `string:length(str)`: Returns the length (number of characters) of the string.
  | Argument | Type     | Description            |
  |----------|----------|------------------------|
  | `str`    | `string` | String to be measured. |

- `string:replace(str, from, to, count)`: Returns the string with occurrences of `from` replaced by `to`. The number of replacements is limited by `count` (if provided).
  | Argument | Type      | Description                                           |
  |----------|-----------|-------------------------------------------------------|
  | `str`    | `string`  | String to be modified.                                |
  | `from`   | `string`  | Substring to be replaced.                             |
  | `to`     | `string`  | Substring that replaces the original substring.       |
  | `count`  | `number?` | (Optional) Maximum number of replacements to perform. |

- `string:contains(str, substring)`: Returns a `boolean` indicating whether the string contains the substring.
  | Argument    | Type     | Description                      |
  |-------------|----------|----------------------------------|
  | `str`       | `string` | String to be checked.            |
  | `substring` | `string` | Substring to look for in string. |

- `string:split(str, delimiter)`: Returns a `string[]` table containing the parts of the string split by the delimiter.
  | Argument    | Type     | Description                         |
  |-------------|----------|-------------------------------------|
  | `str`       | `string` | String to be split.                 |
  | `delimiter` | `string` | Delimiter used to split the string. |

---

## Module `unichat:time`

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

## Module `unichat:yaml`

The **UniChat** YAML module is available via `require` as `unichat:yaml`.
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
  | Argument | Type    | Description              |
  |----------|---------|--------------------------|
  | `table`  | `table` | Lua table to be encoded. |

- `yaml:decode(string)`: Decodes a YAML string into a Lua table.
  | Argument | Type     | Description                |
  |----------|----------|----------------------------|
  | `str`    | `string` | YAML string to be decoded. |

!> **Note**: The YAML module may not support all YAML features and is intended for basic use cases.
