/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { invoke } from "@tauri-apps/api/core";
import StackTrace from "stacktrace-js";

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
        this._doLog("trace", null, null, message, ...args);
    }

    public debug(message: string, ...args: any[]): void {
        this._doLog("debug", null, null, message, ...args);
    }

    public info(message: string, ...args: any[]): void {
        this._doLog("info", null, null, message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this._doLog("warn", null, null, message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        this._doLog("error", null, null, message, ...args);
    }

    private _doLog(level: LogLevel, file: string | null, line: number | null, message: string, ...args: any[]): void {
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

    private async _emit(level: LogLevel, file: string | null, line: number | null, data: string): Promise<void> {
        let fileName = file || this.name;
        let lineNumber: number | null = line || null;

        if (fileName != null || lineNumber != null) {
            const callStack = StackTrace.getSync();
            const callSite = callStack[5];

            if (callSite != null) {
                const _fileName = callSite.fileName;
                const _lineNumber = callSite.lineNumber;

                // Only use stack trace info in development mode, otherwise the path contains `/js/` that points to the bundled files.
                if (_fileName != null && _fileName.includes("/src/")) {
                    fileName = fileName || _fileName.split("/src/")[1] || this.name;
                    lineNumber = lineNumber || _lineNumber || null;
                }
            }
        }

        invoke("plugin:log|log", {
            level: logLevelToNumber(level),
            message: data,
            location: `${fileName}${lineNumber ? `:${lineNumber}` : ""}`,
            file: fileName,
            line: lineNumber || null,
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
