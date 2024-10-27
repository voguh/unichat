# Voguh's UniChat

UniChat is a companion tool for streamers who broadcast on YouTube. The goal is to provide an overlay
with the chat with support for BTTV emotes and customization using HTML/CSS/JS.


### App directories

| DIR TYPE           | LOCATION ON LINUX                           | LOCATION ON WINDOWS                          | LOCATION ON MAC                                        |
|--------------------|---------------------------------------------|----------------------------------------------|--------------------------------------------------------|
| app_cache_dir      | ~/.cache/io.github.voguh.unichat            | ~\AppData\Local\io.github.voguh.unichat      | ~/Library/Caches/io.github.voguh.unichat               |
| app_config_dir     | ~/.config/io.github.voguh.unichat           | ~\AppData\Roaming\io.github.voguh.unichat    | ~/Library/Application\ Support/io.github.voguh.unichat |
| app_data_dir       | ~/.local/share/io.github.voguh.unichat      | ~\AppData\Roaming\io.github.voguh.unichat    | ~/Library/Application\ Support/io.github.voguh.unichat |
| app_local_data_dir | ~/.local/share/io.github.voguh.unichat      | ~\AppData\Local\io.github.voguh.unichat      | ~/Library/Application\ Support/io.github.voguh.unichat |
| app_log_dir        | ~/.local/share/io.github.voguh.unichat/logs | ~\AppData\Local\io.github.voguh.unichat\logs | ~/Library/Logs/io.github.voguh.unichat                 |


### Build

Install all dependencies before following [oficial tutorial](https://v2.tauri.app/start/prerequisites/)
After that, just run build with:

```sh
pnpm build
```

> [!TIP]
> If the build fails on macOS and Linux, adding the environment variable `NO_STRIP=true` before the build command may help.
> Example: `NO_STRIP=true pnpm build`


### TODO

Implement support for BTTV, by calling api `https://api.betterttv.net/3/cached/users/youtube/<CHANNEL_ID>`
and image tag like `<img src="https://cdn.betterttv.net/emote/<EMOTE_ID>/3x.<IMAGE_TYPE>" />`

- [x] Implement `Message` event;
- [x] Implement `RemoveMessage` event;
- [x] Implement `RemoveAuthor` event;
- [x] Implement `Raid` event;
- [x] Implement `Sponsor` event;
- [x] Implement `SponsorGift` event;
- [x] Implement `Donate` event;
- [ ] Implement an way to get youtube channel id or store in `unichat.db`
- [ ] Implement overlay with bttv support;


### Known issues

In my tests, I noticed that Tauri has issues with Wayland (tested only on Fedora 40 with GNOME).

Below are the issues I detected:
- `The chat window is not resized correctly`
- `The window decorator buttons do not respect the user's settings, position, and visible buttons.`

This issue can be worked around by setting the GDK_BACKEND variable to x11.

In VSCode, the environment variable `GDK_BACKEND` is already set to `x11`, so the issue usually doesn’t
occur if you run the project through the integrated terminal. If you use an external terminal, just
run it with `GDK_BACKEND="x11" pnpm dev`.
