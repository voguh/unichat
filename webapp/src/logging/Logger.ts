/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
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

export class Logger {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    public trace(message: string, ...args: any[]): void {
        this._doLog("trace", message, ...args);
    }

    public debug(message: string, ...args: any[]): void {
        this._doLog("debug", message, ...args);
    }

    public info(message: string, ...args: any[]): void {
        this._doLog("info", message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this._doLog("warn", message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        this._doLog("error", message, ...args);
    }

    private _doLog(level: LogLevel, message: string, ...args: any[]): void {
        const [formattedMessage, throwable] = this._formatMessage(message, args);

        if (!logLevelGuard(level)) {
            level = "info";
        }

        this._emit(level, formattedMessage);
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

            this._emit("error", errorMessage);
            console.error(throwable);
        }
    }

    private _emit(level: LogLevel, data: string): void {
        invoke("plugin:log|log", {
            level: logLevelToNumber(level),
            message: data,
            location: this.name,
            keyValues: null
        });
    }

    private _formatMessage(message: string, args: any[]): [string, Error | null] {
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
