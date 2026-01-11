# Plugin Development Guide

#### Table of Contents
- [Introduction](#introduction)
- [Plugin structure](#plugin-structure)

#### Extra
- [UniChat API](/plugins/unichat_api)
- [Auxiliary Modules](/plugins/auxiliary_modules)
- [Global Factories](/plugins/global_factories)

---

## Introduction

**UniChat** plugins are primarily written in Lua.

What can a plugin do?
- Register new scrapers;
- Expose new modules for other plugins to use;
- Listen to **UniChat** events and react to them;
- View/modify the userstore;
- Provide widgets;

---

## Plugin structure

Plugins can be installed in the `plugins/` folder of **UniChat** located at:
- Windows: `%LOCALAPPDATA%\unichat\plugins\`
- Linux: `~/.local/share/unichat/plugins/`

So, the folder structure of a typical plugin is as follows:
```
plugin-example
├── assets (optional)
├── data
│   └── main.lua (plugin entrypoint)
├── widgets (optional)
├── icon.png (optional)
└── manifest.yaml (required)
```

!> The plugin folder name must contain only ASCII alphanumeric characters, hyphens, or underscores.

#### `assets/` folder

This folder is optional and is intended to provide static files. They can be accessed via the URL `http://localhost:9527/assets/{plugin-id}/{asset-path}`.

#### `data/` folder

This folder is required and must contain at least one `main.lua` file, which is the plugin entry point. All plugin code must be inside this folder.

!> When the plugin registers a scraper, the scraper’s JavaScript file must also be inside the `data/` folder.

#### `widgets/` folder

This folder is optional; it may contain subfolders with widgets provided by the plugin. See [Widget Development Guide](/widgets/getting_started) for more details.

#### `icon.png` file

This file is optional and must be a PNG image representing the plugin icon. If not provided, a default icon will be used.

#### `manifest.yaml` file

This file is required and must contain the following information:

| Field        | Type       | Required | Description                                      |
|--------------|------------|----------|--------------------------------------------------|
| name         | `string`   | YES      | Plugin name                                      |
| description  | `string`   | NO       | Plugin description                               |
| version      | `string`   | YES      | Plugin version                                   |
| author       | `string`   | NO       | Plugin author                                    |
| license      | `string`   | NO       | Plugin license <sup>[3]</sup>                    |
| homepage     | `string`   | NO       | Plugin homepage URL                              |
| dependencies | `string[]` | YES      | Plugin dependencies <sup>[1]</sup><sup>[2]</sup> |

<sup>[1]</sup> Currently the only verified dependency is `unichat`, which indicates the **UniChat** version range required by the plugin.

<sup>[2]</sup> Dependencies must follow the format `<dependency-name>@<version-range>`, where `<version-range>` follows this pattern:
> | Example          | Meaning                                                 |
> |------------------|---------------------------------------------------------|
> | `1.2.3`          | Exactly version 1.2.3                                   |
> | `[1.2.3,)`       | Version 1.2.3 or higher                                 |
> | `[1.2.3,2.0.0)`  | Version between 1.2.3 (inclusive) and 2.0.0 (exclusive) |
>
> Delimiters `[]` are inclusive and `()` are exclusive.

<sup>[3]</sup> No validation is currently performed, but it is advisable to use a valid license according to the [SPDX License List](https://spdx.org/licenses/).

---

## Globals

| Name              | Type       | Description                                                                                                                          |
|-------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------|
| __PLUGIN_NAME     | `string`   | Plugin name.                                                                                                                         |
| __PLUGIN_VERSION  | `string`   | Plugin version.                                                                                                                      |
| UniChatAPI        | `userdata` | Instance of the UniChat API for the plugin.<br/>See [UniChatAPI](/plugins/unichat_api) for more details.                             |
| UniChatPlatform   | `userdata` | A factory to populate the platform name.<br/>See [UniChatPlatform](/plugins/global_factories?id=unichatplatform) for more details.   |
| UniChatAuthorType | `userdata` | A factory to populate the author name.<br/>See [UniChatAuthorType](/plugins/global_factories?id=unichatauthortype) for more details. |
| UniChatEvent      | `userdata` | A factory to populate the event name.<br/>See [UniChatEvent](/plugins/global_factories?id=unichatevent) for more details.            |
| UniChatEmote      | `userdata` | A factory to populate the emote name.<br/>See [UniChatEmote](/plugins/global_factories?id=unichatemote) for more details.            |
| UniChatBadge      | `userdata` | A factory to populate the badge name.<br/>See [UniChatBadge](/plugins/global_factories?id=unichatbadge) for more details.            |
