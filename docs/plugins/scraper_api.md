# Scraper API

**UniChat**'s Scrapper API exposes some helper functions and allow data scraping from webview.

---

### Logger API

This is a global available as `uniChatLogger`.

It uses parameterized logging similar to Java’s `slf4j`.
Each argument replaces `{}` in the message in the order passed.
If the last argument is an error, it is logged as a stacktrace and is not used for substitution.

Example usage:
```javascript
uniChatLogger.debug("Debug message: {}", "details here");
uniChatLogger.info("User {} has joined the chat", username);
uniChatLogger.warn("Low disk space: {}% remaining", freeSpacePercent);
uniChatLogger.error("Failed to load resource: {}", resourceUrl, new Error("Network error"));
```

#### Functions

- `uniChatLogger.trace(template, ...)`: Logs a trace message.
  | Argument   | Type     | Description                                                           |
  |------------|----------|-----------------------------------------------------------------------|
  | `template` | `string` | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...        | `any`    | Arguments to replace the placeholders in the message.                 |

- `uniChatLogger.debug(template, ...)`: Logs a debug message.
  | Argument   | Type     | Description                                                           |
  |------------|----------|-----------------------------------------------------------------------|
  | `template` | `string` | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...        | `any`    | Arguments to replace the placeholders in the message.                 |

- `uniChatLogger.info(template, ...)`: Logs an info message.
  | Argument   | Type     | Description                                                           |
  |------------|----------|-----------------------------------------------------------------------|
  | `template` | `string` | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...        | `any`    | Arguments to replace the placeholders in the message.                 |

- `uniChatLogger.warn(template, ...)`: Logs a warning message.
  | Argument   | Type     | Description                                                           |
  |------------|----------|-----------------------------------------------------------------------|
  | `template` | `string` | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...        | `any`    | Arguments to replace the placeholders in the message.                 |

- `uniChatLogger.error(template, ...)`: Logs an error message.
  | Argument   | Type     | Description                                                           |
  |------------|----------|-----------------------------------------------------------------------|
  | `template` | `string` | Message to be logged.<br/>May contain `{}` for argument substitution. |
  | ...        | `any`    | Arguments to replace the placeholders in the message.                 |

---

### Scraper API

This is a global available as `uniChat`.

It exposes functions to help with scraping data from webviews.

Example usage:
```javascript
uniChat.preFetch = async function(args) {
    // Modify fetch arguments
    return args;
};

uniChat.onFetchResponse = async function(response, args) {
    // Process fetch response
};

uniChat.dispatchEvent({ type: "custom_event" });
```

#### Functions

- `uniChat.dispatchEvent(event)`: Dispatches a custom event to UniChat.
  | Argument | Type     | Description                         |
  |----------|----------|-------------------------------------|
  | `event`  | `object` | Event object containing event data. |

  This is the way for the scraper script to communicate with the LUA code, the data sent will be processed by the `on_event` function registered in [`UniChatAPI:register_scraper`](/plugins/unichat_api?id=unichatapiregister_scraperid-name-scraper_js_path-on_event-opts).

- `uniChat.onWebSocketMessage(event, { wsInstance, url, protocols })`: Assigned function that is called when a WebSocket message is received.
  | Argument                         | Type           | Description                                                                                                                             |
  |----------------------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
  | `event`                          | `MessageEvent` | The WebSocket message event.                                                                                                            |
  | `{ wsInstance, url, protocols }` | `object`       | Additional context about the WebSocket connection.<br/>See [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). |

  This function can be assigned by the your scraper script to handle incoming WebSocket messages.

- `uniChat.preWebSocketSend(data, { wsInstance, url, protocols })`: Assigned function that is called before a WebSocket message is sent.
  | Argument                         | Type                                | Description                                                                                                                             |
  |----------------------------------|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
  | `data`                           | `string` \| `ArrayBuffer` \| `Blob` | The data to be sent over the WebSocket.                                                                                                 |
  | `{ wsInstance, url, protocols }` | `object`                            | Additional context about the WebSocket connection.<br/>See [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). |

  This function can be assigned by your scraper script to modify the data before it is sent.
  It should return the modified data.

- `uniChat.onWebSocketSend(data, { wsInstance, url, protocols })`: Assigned function that is called after a WebSocket message is sent.
  | Argument                         | Type                                | Description                                                                                                                             |
  |----------------------------------|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
  | `data`                           | `string` \| `ArrayBuffer` \| `Blob` | The data that was sent over the WebSocket.                                                                                              |
  | `{ wsInstance, url, protocols }` | `object`                            | Additional context about the WebSocket connection.<br/>See [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). |

  This function can be assigned by your scraper script to handle post-send actions.

- `uniChat.preFetch(args)`: Assigned function that is called before a fetch request is made.
  | Argument | Type    | Description                                                                                                                            |
  |----------|---------|----------------------------------------------------------------------------------------------------------------------------------------|
  | `args`   | `array` | The arguments to be passed to `fetch()`.<br/> See [MDN fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). |

  This function can be assigned by your scraper script to modify the fetch arguments.
  It should return the modified arguments.

- `uniChat.onFetchRequest(args)`: Assigned function that is called after a fetch request is made.
  | Argument | Type    | Description                                                                                                                                |
  |----------|---------|--------------------------------------------------------------------------------------------------------------------------------------------|
  | `args`   | `array` | The arguments that were passed to `fetch()`.<br/> See [MDN fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). |

  This function can be assigned by your scraper script to handle post-request actions.

- `uniChat.onFetchResponse(response, args)`: Assigned function that is called when a fetch response is received.
  | Argument   | Type       | Description                                                                                                                                |
  |------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------|
  | `response` | `Response` | The fetch response object.<br/> See [MDN Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).                             |
  | `args`     | `array`    | The arguments that were passed to `fetch()`.<br/> See [MDN fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). |

  This function can be assigned by your scraper script to handle fetch responses.
