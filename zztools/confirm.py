# ******************************************************************************
#  Copyright (c) 2026 Voguh
#
#  This program and the accompanying materials are made
#  available under the terms of the Eclipse Public License 2.0
#  which is available at https://www.eclipse.org/legal/epl-2.0/
#
#  SPDX-License-Identifier: EPL-2.0
# ******************************************************************************

def confirm(prompt: str) -> bool:
    response = input(f"{prompt} ([\033[32mY\033[0m]es/[\033[31mN\033[0m]o) ")
    first = response.strip().lower()[:1]
    return first == "y"
