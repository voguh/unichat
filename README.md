# Voguh's UniChat

UniChat is a companion tool for streamers who broadcast on YouTube. The goal is
to provide an widget with the chat with support for BTTV emotes and
customization using HTML/CSS/JS.


## TODO

- [x] Implement `Message` event;
- [x] Implement `RemoveMessage` event;
- [x] Implement `RemoveAuthor` event;
- [x] Implement `Raid` event;
- [x] Implement `Sponsor` event;
- [x] Implement `SponsorGift` event;
- [x] Implement `Donate` event (Sicker and Super Chat);
- [x] Implement an way to get youtube channel id;
- [x] Implement BTTV support <sup>1</sup>;
- [x] Implement FFZ support <sup>2</sup>;
- [x] Implement 7TV support <sup>3</sup>;
- [x] Implement twitch chat integration;
- [ ] Implement a second youtube scrapper to allow two chats (to merge chats between normal video and shorts for example);

1. BetterTTV endpoints:
    - `https://api.betterttv.net/3/cached/emotes/global`
    - `https://api.betterttv.net/3/cached/users/{youtube|twitch}/{CHANNEL_ID}`
    - `https://cdn.betterttv.net/emote/{EMOTE_ID}/{EMOTE_SIZE:3x}.{IMAGE_TYPE:webp}`
2. FrankerFaceZ endpoints:
    - `https://api.betterttv.net/3/cached/frankerfacez/emotes/global`
    - `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/{CHANNEL_ID}`
    - `https://cdn.betterttv.net/frankerfacez_emote/{EMOTE_ID}/{EMOTE_SIZE:4}`
3. SevenTV endpoints:
    - `https://7tv.io/v3/emote-sets/global`
    - `https://7tv.io/v3/users/{youtube|twitch}/{CHANNEL_ID}`
    - `https://cdn.7tv.app/emote/{EMOTE_ID}/{EMOTE_SIZE:4x}.{IMAGE_TYPE:webp}`


## Dev notes

### Build

Install all dependencies before following [oficial tutorial](https://v2.tauri.app/start/prerequisites/)
then just run `pnpm build`.

Following an example using ubuntu 24.04 docker image.

```bash
docker run --volume=".:/home/ubuntu/unichat" --env="TAURI_APP_PATH=/home/ubuntu/unichat" --env="TAURI_FRONTEND_PATH=/home/ubuntu/unichat/webapp" --env="DEBIAN_FRONTEND=noninteractive" --rm -it ubuntu:24.04 bash

### Prepare environment
apt update && apt upgrade -y && apt install sudo
passwd -d ubuntu
su - ubuntu
cd ~/unichat

### Install dependencies
sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

### Install cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.87.0
. "$HOME/.cargo/env"

### Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

### Install node and pnpm
nvm i 22.14.0
corepack enable pnpm
corepack prepare pnpm@10.7.1 --activate
pnpm config set store-dir ~/.pnpm-store

### Install CLI
cargo install tomlq --locked
cargo install tauri-cli --locked --version "$(tq -r -f "Cargo.toml" '.dependencies.tauri.version')"

### Build
pnpm --dir="./webapp" install --frozen-lockfile
cargo tauri build



# Build for windows
### Install dependencies
sudo apt install -y nsis lld llvm clang

### Install rustup target
rustup target add x86_64-pc-windows-msvc

### Install cargo-xwin
cargo install --locked cargo-xwin

### Build
pnpm --dir="./webapp" install --frozen-lockfile
cargo tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc
```

> [!TIP]
> If the build fails on macOS and Linux, adding the environment variable `NO_STRIP=true` before the build command may help.
> Example: `NO_STRIP=true pnpm build`


### App directories

| DIR TYPE           | LOCATION ON LINUX           | LOCATION ON WINDOWS          |
|--------------------|-----------------------------|------------------------------|
| app_cache_dir      | ~/.cache/unichat            | ~\AppData\Local\unichat      |
| app_config_dir     | ~/.config/unichat           | ~\AppData\Roaming\unichat    |
| app_data_dir       | ~/.local/share/unichat      | ~\AppData\Roaming\unichat    |
| app_local_data_dir | ~/.local/share/unichat      | ~\AppData\Local\unichat      |
| app_log_dir        | ~/.local/share/unichat/logs | ~\AppData\Local\unichat\logs |


### Package versions

Some node packages will not be updated.

| Package                                | Reason                                                              |
|----------------------------------------|---------------------------------------------------------------------|
| `react@18.3.1`                         | No need to update to version 19.x.x                                 |
| `react-dom@18.3.1`                     | No need to update to version 19.x.x and keep the same version react |
| `@types/node22.x.x`                    | Must stay on the same major version as current node                 |
| `@types/react@18.3.1`                  | Must stay on the same version as react                              |
| `@types/react-dom@18.3.1`              | Must stay on the same version as react-dom                          |
| `eslint@8.57.1`                        | API breaking changes in version >= 9.x.x                            |
| `eslint-plugin-import-helpers@1.3.1`   | Maintains compatibility with eslint@8.57.1                          |
| `eslint-plugin-n@16.6.2`               | Maintains compatibility with eslint@8.57.1                          |
| `eslint-plugin-promise@6.6.0`          | Maintains compatibility with eslint@8.57.1                          |


### Known issues

In my tests, I noticed that Tauri has issues with Wayland (tested on Fedora 40 with GNOME).

Below are the issues I detected:
1. The chat window is not resized correctly;
2. The window decorator buttons do not respect the user's settings, position, and visible buttons (In KDE works normal);

This issue can be worked around by setting the `GDK_BACKEND` variable to `x11`.

In VSCode, the environment variable `GDK_BACKEND` is already set to `x11`, so the issue usually doesn’t
occur if you run the project through the integrated terminal. If you use an external terminal, just
run it with `GDK_BACKEND="x11" pnpm dev`.


## License

This project is under [GNU LESSER GENERAL PUBLIC LICENSE, Version 3](./LICENSE), except example widgets under `widgets/default` folder, that are under MIT license.
