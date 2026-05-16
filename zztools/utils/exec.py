# ******************************************************************************
#  Copyright (c) 2026 Voguh
#
#  This program and the accompanying materials are made
#  available under the terms of the Eclipse Public License 2.0
#  which is available at https://www.eclipse.org/legal/epl-2.0/
#
#  SPDX-License-Identifier: EPL-2.0
# ******************************************************************************

from typing import IO, TextIO

from .constants import ROOT_PATH, TAURI_APP_PATH, TAURI_FRONTEND_PATH
import os
import re
import subprocess
import sys
import threading

ANSI_ESCAPE = re.compile(r"\033\[[0-9;]*[mABCDEFGHJKSTfnsulh]")
def _visible(line: str) -> bool:
    return bool(ANSI_ESCAPE.sub("", line).strip())

def _stream_reader(input_stream: IO[bytes], output_list: list[str], output_stream: TextIO, prefix: str):
    try:
        for raw_line in iter(lambda: input_stream.readline(), b""):
            decoded = raw_line.decode("utf-8", errors="replace").rstrip()
            output_list.append(decoded)
            if _visible(decoded):
                output_stream.write(f"{prefix} {decoded}\n")
                output_stream.flush()
    except ValueError:
        pass
    except OSError as e:
        output_stream.write(f"{prefix} [ERROR] {e}\n")
        output_stream.flush()


def exec(command: list[str] | str, timeout: float = 300, **kwargs) -> subprocess.CompletedProcess:
    prefix = "\033[0m[\033[1;35mEXEC\033[0m]"

    env = os.environ.copy()
    env["TAURI_APP_PATH"] = str(TAURI_APP_PATH)
    env["TAURI_FRONTEND_PATH"] = str(TAURI_FRONTEND_PATH)
    if sys.stdout.isatty():
        env["FORCE_COLOR"] = "1"
        env["CLICOLOR_FORCE"] = "1"
        env["TERM"] = "xterm-256color"

    defaults = { "env": env, "cwd": ROOT_PATH }
    merged_args = { **defaults, **kwargs }
    check = merged_args.pop("check", True)

    full_stdout: list[str] = []
    full_stderr: list[str] = []
    with subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **merged_args) as process:
        thread_out = threading.Thread(target=_stream_reader, args=(process.stdout, full_stdout, sys.stdout, prefix))
        thread_err = threading.Thread(target=_stream_reader, args=(process.stderr, full_stderr, sys.stderr, prefix))

        thread_out.start()
        thread_err.start()
        thread_out.join(timeout=timeout)
        thread_err.join(timeout=timeout)

    if check and process.returncode != 0:
        raise subprocess.CalledProcessError(process.returncode, command, output="\n".join(full_stdout), stderr="\n".join(full_stderr))

    return subprocess.CompletedProcess(command, process.returncode,stdout="\n".join(full_stdout),stderr="\n".join(full_stderr))

if __name__ == "__main__":
    print("This file is not meant to be run directly.")
