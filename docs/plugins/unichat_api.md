# Plugins UniChat API

In the Lua environment, you will have access to the **UniChat** API through the global `UniChatAPI` object.

---

### UniChatAPI:register_scraper(id, name, scrapper_js_path, on_event, opts)

Registers a new scraper for **UniChat**.

#### Method Arguments

| Argument          | Type       | Description                                                                                                                                    |
|-------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `id`              | `string`   | Unique identifier of the scraper. Must contain only ASCII alphanumeric characters, hyphens, or underscores and must end with `-chat`.          |
| `name`            | `string`   | Human-readable name of the scraper.                                                                                                            |
| `scraper_js_path` | `string`   | Path to the JavaScript file that implements the scraper. This path must be relative, and the JavaScript file must be inside the `data` folder. |
| `on_event`        | `function` | Function to listen to scraper events.<br/>This function receives a `table` as argument and must return a `UniChatEvent` or `nil`.              |
| `opts`            | `table?`   | (Optional) Table of additional options for the scraper.<br/>See the table below for more details.                                              |

#### Options Table Parameters

All options are optional. If an option is not provided, the default value will be used.

| Options Table Parameters  | Type        | Description                                                                                                                                                              |
|---------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `editing_tooltip_message` | `string?`   | Scraper editing tooltip message.<br/>Default: `Enter <scraper_name> chat url...`                                                                                         |
| `editing_tooltip_urls`    | `string[]?` | Valid URLs for the scraper.<br/>Default: `{}`                                                                                                                            |
| `placeholder_text`        | `string?`   | Placeholder text for the scraper.<br/>Default: `Enter <Scraper Name> chat url...`                                                                                        |
| `badges`                  | `string[]?` | Badges for the scraper.                                                                                                                                                  |
| `icon`                    | `string?`   | Icon for the scraper (FontAwesome 5).<br/>Default: `fas fa-video`                                                                                                        |
| `validate_url`            | `function?` | Function to validate scraper URLs. Default function always returns the original value.<br/>This function receives a single `string` argument and must return a `string`. |
| `on_ready`                | `function?` | Function to be called when the scraper is ready.                                                                                                                         |
| `on_ping`                 | `function?` | Function to be called when the scraper receives a ping.                                                                                                                  |
| `on_error`                | `function?` | Function to be called when the scraper encounters an error.                                                                                                              |

Usage example:
```lua
local function validate_kick_url(url)
    -- Logic to validate and possibly transform the chat URL.
end

local function on_kick_ready(event)
    -- Argument `event` contains values returned by js scraper `uniChatInit` function.
    -- You can handle scraper ready logic here. For example save channel_id.
end

local function on_kick_event(event)
    -- Argument `event` contains values returned by js scraper.
    -- You can handle scraper 'raw' events here and return a UniChatEvent.
end

local opts = {
    editing_tooltip_message = "You can enter just the channel name or one of the following URLs to get the Kick chat:",
    editing_tooltip_urls = {
        "kick.com/popout/{CHANNEL_NAME}/chat",
        "kick.com/{CHANNEL_NAME}",
    },
    placeholder_text = "https://kick.com/popout/{CHANNEL_NAME}/chat",
    badges = { "experimental" },
    icon = "fas fa-video",
    validate_url = validate_kick_url,
    on_ready = on_kick_ready
}

UniChatAPI:register_scraper("kick-chat", "Kick", "static/scraper.js", on_kick_event, opts);
```

---

### UniChatAPI:fetch_shared_emotes(platform, channel_id)

Fetches `BTTV`, `FFZ`, and `7TV` emotes for the given platform and channel ID.
This function does not return anything. Just use it to trigger the fetch process.

| Argument     | Type     | Description                                 |
|--------------|----------|---------------------------------------------|
| `platform`   | `string` | Channel ID to fetch the shared emotes for.  |
| `channel_id` | `string` | Callback function that receives the emotes. |

Usage example:
```lua
UniChatAPI:fetch_shared_emotes("twitch", "12345678");
```

---

### UniChatAPI:get_shared_emotes()

This function returns a table where the keys are the emote codes and the values are tables of type [`UniChatEmote`](/widgets/events?id=unichatemote).

Usage example:
```lua
local emotes = UniChatAPI:get_shared_emotes();
for code, emote in pairs(emotes) do
    print("Emote code:", code);
    print("Emote URL:", emote.url);
end
```

---

### UniChatAPI:expose_module(name, module)

Exposes a module for other plugins to use.

| Argument | Type     | Description                                                                         |
|----------|----------|-------------------------------------------------------------------------------------|
| `name`   | `string` | Name of the module to be exposed. (It will be prefixed with `<plugin_name>:<name>`) |
| `module` | `table`  | Table containing the module functions.                                              |

Usage example:
```lua
local my_module = {
    greet = function(name)
        return "Hello, " .. name .. "!";
    end
}

UniChatAPI:expose_module("greeting", my_module);

-- In another plugin/or the same plugin:
local greeting = require("my_plugin:greeting");
print(greeting.greet("World"));  -- Output: Hello, World!
```

---

### UniChatAPI:add_event_listener(callback)

Adds a listener for events emitted by **UniChat**.

| Argument   | Type       | Description                                                                                 |
|------------|------------|---------------------------------------------------------------------------------------------|
| `callback` | `function` | Callback function that receives a [`UniChatEvent`](/widgets/events), should return nothing. |

Usage example:
```lua
local function on_event(event)
    -- Handle the event here.
end

local listener_id = UniChatAPI:add_event_listener(on_event);

-- To remove the event listener later, you can use the listener_id returned.
UniChatAPI:remove_event_listener(listener_id);
```

---

### UniChatAPI:remove_event_listener(listener_id)

Removes a previously added event listener.

| Argument      | Type     | Description                                 |
|---------------|----------|---------------------------------------------|
| `listener_id` | `number` | Listener ID returned by add_event_listener. |

Usage example:
```lua
local function on_event(event)
end

local listener_id = UniChatAPI:add_event_listener(on_event);

-- To remove the event listener later, you can use the listener_id returned.
UniChatAPI:remove_event_listener(listener_id);
```

---

### UniChatAPI:get_userstore_item(key)

Gets an item from the userstore.
This function returns the item value (always of type `string`) or `nil` if the item does not exist.

| Argument | Type     | Description                  |
|----------|----------|------------------------------|
| `key`    | `string` | Key of the item to retrieve. |

Usage example:
```lua
local value = UniChatAPI:get_userstore_item("my_key");
if value then
    print("Value:", value);
else
    print("Item not found.");
end
```

---

### UniChatAPI:set_userstore_item(key, value)

Sets an item in the userstore.
All keys will be prefixed with `<plugin_name>:` to avoid collisions between plugins. If `value` is `nil`, the item will be removed from the userstore.

| Argument | Type              | Description               |
|----------|-------------------|---------------------------|
| `key`    | `string`          | Key of the item to set.   |
| `value`  | `string` \| `nil` | Value of the item to set. |

Usage example:
```lua
UniChatAPI:set_userstore_item("my_key", "my_value"); -- Now `my_key` is set to `my_value`
UniChatAPI:set_userstore_item("my_key", nil); -- Now `my_key` is removed from the userstore
```

---

### UniChatAPI:notify(message)

Displays a notification in **UniChat**.

| Argument   | Type     | Description           |
|------------|----------|-----------------------|
| `message`  | `string` | Notification message. |

Usage example:
```lua
UniChatAPI:notify("This is a notification from my plugin!");
-- A notification will appear in the UniChat UI with title `<plugin_name>` and the provided message.
```
