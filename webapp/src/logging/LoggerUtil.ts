/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { invoke } from "@tauri-apps/api/core";

type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

const logLevelsMap: Record<LogLevel, number> = {
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5
};

function logLevelToNumber(level: LogLevel): number {
    return logLevelsMap[level as LogLevel] || logLevelsMap.info;
}

function logLevelGuard(level: string): level is LogLevel {
    return ["trace", "debug", "info", "warn", "error"].includes(level);
}

export class LoggerUtil {
    public static doLog(level: LogLevel, file: string, line: number, message: string, ...args: any[]): void {
        const [formattedMessage, throwable] = this._formatMessage(message, args);

        if (!logLevelGuard(level)) {
            level = "info";
        }

        this._emit(level, file, line, formattedMessage);
        console[level](formattedMessage);

        if (throwable != null) {
            let errorMessage: string;
            if (throwable.stack != null) {
                if (throwable.stack.startsWith("Error")) {
                    errorMessage = throwable.stack;
                } else {
                    const stack = throwable.stack.split("\n").map((line) => `\tat ${line}`);
                    errorMessage = `Error: ${throwable.message}\n${stack.join("\n")}`;
                }
            } else {
                errorMessage = String(throwable);
            }

            this._emit("error", file, line, errorMessage);
            console.error(throwable);
        }
    }

    private static _emit(level: LogLevel, file: string, line: number, data: string): void {
        invoke("plugin:log|log", {
            level: logLevelToNumber(level),
            message: data,
            location: `${file}${line ? `:${line}` : ""}`,
            file: file,
            line: line || null,
            keyValues: null
        });
    }

    private static _formatMessage(message: string, args: any[]): [string, Error | null] {
        let formattedMessage = message;
        let throwable: Error | null = null;

        if (args.length > 0 && args[args.length - 1] instanceof Error) {
            throwable = args.pop() as Error;
        }

        for (const param of args) {
            formattedMessage = formattedMessage.replace("{}", String(param));
        }

        return [formattedMessage, throwable];
    }
}
