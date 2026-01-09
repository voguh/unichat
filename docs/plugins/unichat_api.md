# UniChat API

In the Lua environment, you will have access to the **UniChat** API through the global `UniChatAPI` object.

#### Functions

- `UniChatAPI:register_scraper(id, name, scrapper_js_path, on_event, opts)`: Registers a new scraper for **UniChat**.
  | Argument                                                     | Type       | Required | Description                                                                                                                                                                           |
  |--------------------------------------------------------------|------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | id                                                           | `string`   | YES      | Unique identifier of the scraper. Must contain only ASCII alphanumeric characters, hyphens, or underscores and must end with `-chat`.                                                 |
  | name                                                         | `string`   | YES      | Human-readable name of the scraper.                                                                                                                                                   |
  | scraper_js_path                                              | `string`   | YES      | Path to the JavaScript file that implements the scraper. This path must be relative, and the JavaScript file must be inside the `data` folder.                                        |
  | on_event                                                     | `function` | YES      | Function to listen to scraper events.<br/>This function receives a `table` as argument and must return a `UniChatEvent` or `nil`.                                                     |
  | opts                                                         | `table`    | NO       | Table of additional options for the scraper.                                                                                                                                          |
  | `opts.editing_tooltip_message`/`opts.editingTooltipMessage`  | `string`   | NO       | Scraper editing tooltip message.<br/>Default: `Enter <scraper_name> chat url...`                                                                                                      |
  | `opts.editing_tooltip_urls`/`opts.editingTooltipUrls`        | `string[]` | NO       | Valid URLs for the scraper.<br/>Default: `{}`                                                                                                                                         |
  | `opts.placeholder_text`/`opts.placeholderText`               | `string`   | NO       | Placeholder text for the scraper.<br/>Default: `Enter <Scraper Name> chat url...`                                                                                                     |
  | `opts.badges`                                                | `string[]` | NO       | Badges for the scraper.                                                                                                                                                               |
  | `opts.icon`                                                  | `string`   | NO       | Icon for the scraper (FontAwesome 5).<br/>Default: `fas fa-video`                                                                                                                     |
  | `opts.validate_url`/`opts.validateUrl`                       | `function` | NO       | Function to validate scraper URLs.<br/>This function receives a single `string` argument and must return a `string`.<br/>Default: Default function always returns the original value. |
  | `opts.on_ready`/`opts.onReady`                               | `function` | NO       | Function to be called when the scraper is ready.                                                                                                                                      |
  | `opts.on_ping`/`opts.onPing`                                 | `function` | NO       | Function to be called when the scraper receives a ping.                                                                                                                               |
  | `opts.on_error`/`opts.onError`                               | `function` | NO       | Function to be called when the scraper encounters an error.                                                                                                                           |

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

- `UniChatAPI:fetch_shared_emotes(platform, channel_id)`: Fetches `BTTV`, `FFZ`, and `7TV` emotes for the given platform and channel ID.
  | Argument  | Type     | Required | Description                                 |
  |-----------|----------|----------|---------------------------------------------|
  | platform  | `string` | YES      | Channel ID to fetch the shared emotes for.  |
  | channel_id| `string` | YES      | Callback function that receives the emotes. |

- `UniChatAPI:expose_module(name, module)`: Exposes a module for other plugins to use.
  | Argument | Type     | Required | Description                                                                         |
  |----------|----------|----------|-------------------------------------------------------------------------------------|
  | name     | `string` | YES      | Name of the module to be exposed. (It will be prefixed with `<plugin_name>:<name>`) |
  | module   | `table`  | YES      | Table containing the module functions.                                              |

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

- `UniChatAPI:add_event_listener(callback)`: Adds a listener for events emitted by **UniChat**.
  | Argument | Type       | Required | Description                                                                                |
  |----------|------------|----------|--------------------------------------------------------------------------------------------|
  | callback | `function` | YES      | Callback function that receives a [`UniChatEvent`](widgets/events), should return nothing. |

  Usage example:
  ```lua
  local function on_event(event)
      -- Handle the event here.
  end

  local listener_id = UniChatAPI:add_event_listener(on_event);

  -- To remove the event listener later, you can use the listener_id returned.
  UniChatAPI:remove_event_listener(listener_id);
  ```

- `UniChatAPI:remove_event_listener(listener_id)`: Removes a previously added event listener.
  | Argument    | Type     | Required | Description                                 |
  |-------------|----------|----------|---------------------------------------------|
  | listener_id | `number` | YES      | Listener ID returned by add_event_listener. |

  Usage example:
  ```lua
  local function on_event(event)
  end

  local listener_id = UniChatAPI:add_event_listener(on_event);

  -- To remove the event listener later, you can use the listener_id returned.
  UniChatAPI:remove_event_listener(listener_id);
  ```

- `UniChatAPI:get_userstore_item(key)`: Gets an item from the userstore.
  | Argument | Type     | Required | Description                  |
  |----------|----------|----------|------------------------------|
  | key      | `string` | YES      | Key of the item to retrieve. |

  This function returns the item value (always of type `string`) or `nil` if the item does not exist.

  Usage example:
  ```lua
  local value = UniChatAPI:get_userstore_item("my_key");
  if value then
      print("Value:", value);
  else
      print("Item not found.");
  end
  ```

- `UniChatAPI:set_userstore_item(key, value)`: Sets an item in the userstore.
  | Argument | Type              | Required | Description               |
  |----------|-------------------|----------|---------------------------|
  | key      | `string`          | YES      | Key of the item to set.   |
  | value    | `string` or `nil` | YES      | Value of the item to set. |

  Usage example:
  ```lua
  UniChatAPI:set_userstore_item("my_key", "my_value"); -- Now `my_key` is set to `my_value`
  UniChatAPI:set_userstore_item("my_key", nil); -- Now `my_key` is removed from the userstore
  ```

- `UniChatAPI:notify(message)`: Displays a notification in **UniChat**.
  | Argument | Type     | Required | Description           |
  |----------|----------|----------|-----------------------|
  | message  | `string` | YES      | Notification message. |

  Usage example:
  ```lua
  UniChatAPI:notify("This is a notification from my plugin!");
  -- A notification will appear in the UniChat UI with title `<plugin_name>` and the provided message.
  ```
