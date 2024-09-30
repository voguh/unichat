# Voguh's UniChat

### TODO

When an implementation of overlay began, put these dependencies in header:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" integrity="sha512-c42qTSw/wPZ3/5LBzD+Bw5f7bSF2oxou6wEb+I/lqeaKV5FDIfMvvRp772y4jcJLKuGUOpbJMdg/BTl50fJYAw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css" integrity="sha512-NhSC1YmyruXifcj/KFRWoC561YpHpc5Jtzgvbuzx5VozKpWvQ+4nXhPdFgmx8xqexRcpAglTj9sIBWINXa8x5w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
```

Implement support for BTTV, by calling api `https://api.betterttv.net/3/cached/users/twitch/<USER_ID>` or `https://api.betterttv.net/3/cached/users/youtube/<CHANNEL_ID>`
and image tag like `<img src="https://cdn.betterttv.net/emote/<EMOTE_ID>/3x.<IMAGE_TYPE>" />`


### App directories

| DIR TYPE           | LOCATION ON LINUX                           | LOCATION ON WINDOWS                          |
|--------------------|---------------------------------------------|----------------------------------------------|
| app_cache_dir      | ~/.cache/io.github.voguh.unichat            | ~\AppData\Local\io.github.voguh.unichat      |
| app_config_dir     | ~/.config/io.github.voguh.unichat           | ~\AppData\Roaming\io.github.voguh.unichat    |
| app_data_dir       | ~/.local/share/io.github.voguh.unichat      | ~\AppData\Roaming\io.github.voguh.unichat    |
| app_local_data_dir | ~/.local/share/io.github.voguh.unichat      | ~\AppData\Local\io.github.voguh.unichat      |
| app_log_dir        | ~/.local/share/io.github.voguh.unichat/logs | ~\AppData\Local\io.github.voguh.unichat\logs |

### Build

Install all dependencies before following [oficial tutorial](https://v2.tauri.app/start/prerequisites/)
After that, just run build with:

```sh
pnpm build
```