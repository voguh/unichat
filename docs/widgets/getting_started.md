# Widget Development Guide

### Table of Contents
- [Introduction](#introduction)
- [Widget structure](#widget-structure)

### Extra
- [Events](/widgets/events)
- [`fields.json` Properties](/widgets/fields)

---

## Introduction

**UniChat** widgets are fully customizable and written in HTML, CSS, and JavaScript.
They can provide their own assets, such as images, fonts, and audio.

- Widgets already include `jquery` version 3.7.1 by default.
- Widgets already include `normalize.css` version 8.0.1 by default.
- Widgets already include `animate.css` version 4.1.1 by default.

---

## Widget structure

Widgets can be installed in the `widgets/` folder of **UniChat** located at:
- Windows: `%LOCALAPPDATA%\unichat\widgets\`
- Linux: `~/.local/share/unichat/widgets/`

So, the folder structure of a typical widget is as follows:
```
widget-example
├── assets (optional)
├── fields.json (optional)
├── widget.css (required)
├── widget.html (required)
└── widget.js (required)
```

!> The widget folder name must contain only ASCII alphanumeric characters, hyphens, or underscores.

---

### `assets/` folder

This folder is optional and is intended to provide static files. They can be accessed via the URL `http://localhost:9527/widget/{widget-name}/assets/{asset-path}`.

---

### `fields.json` file

This file is used by the widget editor to enable customizations. It has syntax similar to StreamElements’ `fields`, making it easy to create widgets for those already familiar with that platform.

- All references to keys defined in `fields.json` written in the `widget.css`, `widget.html` and `widget.js` files following the pattern `{{key}}` will be replaced by the default values or those set by the user in the UniChat widget editor.
- The schema can be found [here](https://github.com/voguh/unichat/blob/main/widgets/fields-schema.json).
- Documentation for each field type can be found [here](/widgets/fields).

Example `fields.json` file:
```json
{
    "$schema": "https://cdn.statically.io/gh/voguh/unichat/1.3.1/widgets/fields-schema.json",
    "checkboxProperty": {
        "type": "checkbox",
        "label": "I'm a checkbox",
        "description": "This is a checkbox property",
        "value": true
    },
    "colorpickerProperty": {
        "type": "colorpicker",
        "label": "I'm a color picker",
        "description": "This is a color picker property with only swatches",
        "value": "#ff0000",
        "withPickerFree": false,
        "swatches": [
            "#000000",
            "#800000",
            "#008000",
            "#808000",
            "#000080",
            "#800080",
            "#008080",
            "#c0c0c0",
            "#808080",
            "#ff0000",
            "#00ff00",
            "#ffff00",
            "#0000ff",
            "#ff00ff",
            "#00ffff",
            "#ffffff"
        ]
    },
    "dividerProperty": {
        "type": "divider"
    },
    "dropdownProperty": {
        "type": "dropdown",
        "label": "I'm a dropdown",
        "description": "This is a dropdown property",
        "value": "option3",
        "options": {
            "option1": "Option 1",
            "option2": "Option 2",
            "option3": "Option 3"
        }
    },
    "numberProperty": {
        "type": "number",
        "label": "I'm a number input",
        "description": "This is a number input property",
        "value": 42,
        "min": 0,
        "max": 100,
        "step": 1
    },
    "textProperty": {
        "type": "text",
        "label": "I'm a text input",
        "description": "This is a text input property",
        "value": "Hello, World!"
    },
    "textareaProperty": {
        "type": "textarea",
        "label": "I'm a textarea",
        "description": "This is a textarea property",
        "value": "This is a longer piece of text.\nIt can span multiple lines."
    },
    "sfxUrl": {
        "type": "filepicker",
        "label": "Sound effect",
        "value": "https://www.myinstants.com/media/sounds/america-ya-hallo.mp3",
        "fileType": ["audio"]
    }
}
```

!> When a property is edited in the widget editor, a `fieldstate.json` file is generated in the widget folder containing the current values set by the user.

---

### `widget.css` file

This file is required and must contain the widget’s CSS code.

---

### `widget.html` file

As with custom StreamElements widgets, this file is the entry point for the widget’s graphical part.

- This file should not contain any extra tags, only the content inside the `<body>`.
- It is not necessary to include `<script>` or `<link>` tags for the `widget.js` and `widget.css` files, as they will be injected automatically.
- You may use other `<script>` or `<link>` tags to include external libraries, such as fonts.

---

### `widget.js` file

This file is required and must contain the widget’s JavaScript code.
On this file you can listen to some window events dispatched by UniChat:

- `unichat:connected`: Dispatched when WebSocket connection is established (or re-established).
  ```javascript
  window.addEventListener("unichat:connected", function ({ detail: data }) {
      // ...
  });
  ```

  !> Before **UniChat** v1.4.0, no detail data was passed to the event listener.

  | Property    | Type     | Description                               |
  |-------------|----------|-------------------------------------------|
  | `userstore` | `object` | A key-value map of the current userstore. |

- `unichat:event`: Dispatched when a new event is received from **UniChat**.
  ```javascript
  window.addEventListener("unichat:event", function ({ detail: event }) {
      // ...
  });
  ```

  > Detail of `unichat:event` event, the `event` object is an [UniChatEvent](/widgets/events) object.

- `unichat:userstore_update`: (Since **UniChat** v1.4.0) Dispatched when userstore is updated.
  ```javascript
  window.addEventListener("unichat:userstore_update", function ({ detail: { key, value } }) {
      // ...
  });
  ```

  | Property | Type     | Description                                   |
  |----------|----------|-----------------------------------------------|
  | `key`    | `string` | The key of the updated userstore entry.       |
  | `value`  | `string` | The new value of the updated userstore entry. |
