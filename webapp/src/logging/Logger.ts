/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { invoke } from "@tauri-apps/api/core";
import { SourceMapConsumer } from "source-map";
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

const _sourceMapsCache: Record<string, SourceMapConsumer> = {};

async function getSourceMap(url: string): Promise<SourceMapConsumer | null> {
    if (_sourceMapsCache[url]) {
        return _sourceMapsCache[url];
    }

    try {
        const sourceMapData = await fetch(url).then((res) => res.json());

        const consumer = await new SourceMapConsumer(sourceMapData);
        _sourceMapsCache[url] = consumer;

        return consumer;
    } catch (_err) {
        return null;
    }
}

export class Logger {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    public trace(message: string, ...args: any[]): void {
        this._doLog("trace", message, args);
    }

    public debug(message: string, ...args: any[]): void {
        this._doLog("debug", message, args);
    }

    public info(message: string, ...args: any[]): void {
        this._doLog("info", message, args);
    }

    public warn(message: string, ...args: any[]): void {
        this._doLog("warn", message, args);
    }

    public error(message: string, ...args: any[]): void {
        this._doLog("error", message, args);
    }

    private _doLog(level: LogLevel, message: string, args: any[]): void {
        const [formattedMessage, throwable] = this._formatMessage(message, args);

        if (!logLevelGuard(level)) {
            level = "info";
        }

        this._emit(level, formattedMessage);
        console[level](formattedMessage);

        if (throwable) {
            this._emit("error", throwable);
            console.error(throwable);
        }
    }

    private async _emit(level: LogLevel, data: string | Error): Promise<void> {
        let fileName = this.name;
        let lineNumber: number | null = null;

        const callStack = StackTrace.getSync();
        const callSite = callStack[5];
        if (callSite != null) {
            const callSiteFileName = callSite.fileName;
            const _lineNUmber = callSite.lineNumber;
            const _columnNumber = callSite.columnNumber;

            if (callSiteFileName != null && _lineNUmber != null && _columnNumber != null) {
                const sourceMapURL = `${callSiteFileName}.map`;
                const consumer = await getSourceMap(sourceMapURL);
                if (consumer != null) {
                    const pos = consumer.originalPositionFor({ line: _lineNUmber, column: _columnNumber });

                    if (pos != null) {
                        fileName = (pos.source || fileName).replace("../..", "");
                        lineNumber = pos.line || lineNumber;
                    }
                }
            }
        }

        if (fileName.startsWith("/src/")) {
            fileName = fileName.replace("/src/", "");
        }

        let formattedMessage: string | null = null;
        if (data instanceof Error) {
            if (typeof data.stack === "string") {
                if (data.stack.startsWith("Error")) {
                    formattedMessage = data.stack;
                } else {
                    const stack = data.stack.split("\n").map((line) => `\tat ${line}`);
                    formattedMessage = `Error: ${data.message}\n${stack.join("\n")}`;
                }
            } else {
                formattedMessage = String(data);
            }
        } else {
            formattedMessage = data;
        }

        invoke("plugin:log|log", {
            level: logLevelToNumber(level),
            message: formattedMessage,
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
