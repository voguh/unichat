# Rust Tauri + React + Typescript


### Build

The command below will create a container of `Debian Bookworm` and will execute the `./zztools/build.sh` script.

The use of the Docker container is optional; if you choose to compile the project on the host system, simply use `yarn tauri build`.
You must ensure that the dependencies for each maker are correctly installed on your system.


```sh
docker run --rm -it -v "$(pwd)":/workdir -w /workdir debian:12.5 /workdir/zztools/build.sh
```