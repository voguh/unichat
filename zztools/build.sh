#!/bin/sh

if [ ! "$(command -v apt)" ]; then
  echo "This script will work only in Debian based systems, missing apt!"
  exit 1
fi

apt update
apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev
  libayatana-appindicator3-dev librsvg2-dev

# Install Rust
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
export PATH="$PATH:$HOME/.cargo/bin"

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"


# Install Node 18.20.0
nvm i v18.20.0

# Install Yarn
npm install -g pnpm

cargo clean
pnpm install
pnpm tauri build --verbose
chown 1000:1000 -R .