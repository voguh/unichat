# Voguh's UniChat

Chat widget for YouTube and Twitch streamers, customizable via HTML/CSS/JS.

## Features

- Twitch and YouTube.
- BetterTTV, FrankerFaceZ and 7TV emotes.
- Messages, donations, subscriptions, raids and more.
- Custom widgets and plugins.

## Installation

Download from [Releases](https://github.com/voguh/unichat/releases):

- **Windows:** `.exe` or `.msi`
- **Linux:** `.deb`, `.rpm` or `.AppImage`
- **macOS:** `.dmg`

## Usage

1. Add the YouTube and/or Twitch channels.
2. Copy the widget URL (globe icon, top right).
3. Add it as a browser source in OBS or similar.
4. Custom widgets go in the user widgets folder (folder icon, top right).

## Development

Widget and plugin docs: [unichat.voguh.me](https://unichat.voguh.me/docs/plugins/getting_started).

Types and schemas: [`@voguh/unichat-api`](./unichat-api/).

### App directories

| Directory            | Linux                         | Windows                       |
|----------------------|-------------------------------|-------------------------------|
| `app_cache_dir`      | `~/.cache/unichat`            | `%localappdata%\unichat`      |
| `app_config_dir`     | `~/.config/unichat`           | `%appdata%\unichat`           |
| `app_data_dir`       | `~/.local/share/unichat`      | `%appdata%\unichat`           |
| `app_local_data_dir` | `~/.local/share/unichat`      | `%localappdata%\unichat`      |
| `app_log_dir`        | `~/.local/share/unichat/logs` | `%localappdata%\unichat\logs` |

### Requirements

- Rust 1.95.0
- Node.js 24.16.0
- PNPM 10.33.4
- [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)
- Tauri CLI: `cargo install tauri-cli --locked`

### Run

```sh
./run.sh
```

### Build

```sh
pnpm --dir="./webapp" install --frozen-lockfile
cargo tauri build
```

> [!TIP]
> If the build fails on Linux or macOS: `NO_STRIP=true cargo tauri build`.

### Known issues

- **Wayland:** rendering and scaling issues. Workaround: `GDK_BACKEND="x11"`.

## License

[EPL-2.0](./LICENSE).

> [!IMPORTANT]
> Widgets in [`widgets/`](./widgets/) are licensed under MIT.
