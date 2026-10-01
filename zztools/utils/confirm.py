# ******************************************************************************
#  UniChat
#  Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
#
#  This Source Code Form is subject to the terms of the Mozilla Public
#  License, v. 2.0. If a copy of the MPL was not distributed with this
#  file, You can obtain one at https://mozilla.org/MPL/2.0/.
# ******************************************************************************

def confirm(prompt: str) -> bool:
    response = input(f"{prompt} ([\033[1;32mY\033[0m]es/[\033[1;31mN\033[0m]o) ")
    first = response.strip().lower()[:1]
    return first == "y"

if __name__ == "__main__":
    print("This file is not meant to be run directly.")
