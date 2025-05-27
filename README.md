# Voguh's UniChat

UniChat is a companion tool for streamers who broadcast on YouTube. The goal is
to provide an overlay with the chat with support for BTTV emotes and
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
- [ ] Implement overlay with bttv support;


## Build

Install all dependencies before following [oficial tutorial](https://v2.tauri.app/start/prerequisites/)
then just run `pnpm build`.

Following an example using ubuntu 24.04 docker image.

```bash
docker run -v .:/home/ubuntu/unichat --rm -it ubuntu:24.04 bash

export DEBIAN_FRONTEND=noninteractive
apt update && apt upgrade -y
apt install -y git curl wget build-essential ca-certificates file libwebkit2gtk-4.1-dev libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

su - ubuntu
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
nvm i 22.14.0
corepack enable pnpm
corepack prepare pnpm@10.7.1 --activate
pnpm config set store-dir ~/.pnpm-store
pnpm install
pnpm build
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
