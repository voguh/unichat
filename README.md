# Voguh's UniChat

UniChat is a companion tool for streamers who broadcast on YouTube. The goal is
to provide an widget with the chat with support for BTTV emotes and
customization using HTML/CSS/JS.


## TODO

Implement support for BTTV, by calling api `https://api.betterttv.net/3/cached/users/youtube/<CHANNEL_ID>`
and image tag like `<img src="https://cdn.betterttv.net/emote/<EMOTE_ID>/3x.<IMAGE_TYPE>" />`

- [x] Implement `Message` event;
- [x] Implement `RemoveMessage` event;
- [x] Implement `RemoveAuthor` event;
- [x] Implement `Raid` event;
- [x] Implement `Sponsor` event;
- [x] Implement `SponsorGift` event;
- [x] Implement `Donate` event;
- [x] Implement an way to get youtube channel id or store in `unichat.db`
- [ ] Implement widget with bttv support;


## Build

Install all dependencies before following [oficial tutorial](https://v2.tauri.app/start/prerequisites/)
then just run `pnpm build`.

Following an example using ubuntu 24.04 docker image (catthehacker/ubuntu).

```bash
docker run --workdir="/home/ubuntu/unichat" --volume=".:/home/ubuntu/unichat" --env="DEBIAN_FRONTEND=noninteractive" --rm -it ghcr.io/catthehacker/ubuntu:act-24.04 bash

### Remove ubuntu user password
passwd -d ubuntu

### Checkout to ubuntu user
su - ubuntu
cd ~/unichat

### Update packages
sudo apt update
sudo apt upgrade -y

### Install dependencies
sudo apt install --no-install-recommends -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

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

### Build
pnpm install --frozen-lockfile
pnpm build



# Build for windows
### Install dependencies
sudo apt install --no-install-recommends -y  nsis lld llvm clang

### Install rustup target
rustup target add x86_64-pc-windows-msvc

### Install cargo-xwin
cargo install --locked cargo-xwin

### Build
pnpm install --frozen-lockfile
pnpm build --runner cargo-xwin --target x86_64-pc-windows-msvc
```

> [!TIP]
> If the build fails on macOS and Linux, adding the environment variable `NO_STRIP=true` before the build command may help.
> Example: `NO_STRIP=true pnpm build`


### App directories

| DIR TYPE           | LOCATION ON LINUX           | LOCATION ON WINDOWS          | LOCATION ON MAC                        |
|--------------------|-----------------------------|------------------------------|----------------------------------------|
| app_cache_dir      | ~/.cache/unichat            | ~\AppData\Local\unichat      | ~/Library/Caches/unichat               |
| app_config_dir     | ~/.config/unichat           | ~\AppData\Roaming\unichat    | ~/Library/Application\ Support/unichat |
| app_data_dir       | ~/.local/share/unichat      | ~\AppData\Roaming\unichat    | ~/Library/Application\ Support/unichat |
| app_local_data_dir | ~/.local/share/unichat      | ~\AppData\Local\unichat      | ~/Library/Application\ Support/unichat |
| app_log_dir        | ~/.local/share/unichat/logs | ~\AppData\Local\unichat\logs | ~/Library/Logs/unichat                 |


### Dev notes

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

This project is under [GNU LESSER GENERAL PUBLIC LICENSE, Version 3](./LICENSE).
