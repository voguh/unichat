/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
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

    private async _emit(level: LogLevel, data: string): Promise<void> {
        let fileName = this.name;
        let lineNumber: number | null = null;

        const callStack = await StackTrace.get();
        const callSite = callStack[__PLATFORM__ === "windows" ? 3 : 4];

        if (callSite != null) {
            const _fileName = callSite.fileName;
            const _lineNumber = callSite.lineNumber;

            if (_fileName != null && _lineNumber != null) {
                fileName = _fileName.split("/src/")[1] || fileName;
                lineNumber = _lineNumber || lineNumber;
            }
        }

        invoke("plugin:log|log", {
            level: logLevelToNumber(level),
            message: data,
            location: `${fileName}${lineNumber !== null ? `:${lineNumber}` : ""}`,
            file: fileName,
            line: lineNumber,
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
