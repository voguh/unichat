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

const logLevelsMap: Record<string, number> = {
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5
};

function toLogLevel(level: string): number {
    return logLevelsMap[level] || logLevelsMap.info;
}

function initializeFunctionGuard(obj: any): obj is { initialize: (arg: Record<string, string>) => void } {
    return typeof obj.initialize === "function";
}

if (initializeFunctionGuard(SourceMapConsumer)) {
    SourceMapConsumer.initialize({ "lib/mappings.wasm": "/source-map/mappings.wasm" });
}

const _sourceMapsCache: Record<string, SourceMapConsumer> = {};

async function getSourceMap(url: string): Promise<SourceMapConsumer> {
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

    private _doLog(level: string, message: string, args: any[]): void {
        const [formattedMessage, throwable] = this._formatMessage(message, args);

        if (!["trace", "debug", "info", "warn", "error"].includes(level)) {
            level = "info";
        }

        this._emit(level, formattedMessage);
        console[level](formattedMessage);

        if (throwable) {
            this._emit("error", throwable);
            console.error(throwable);
        }
    }

    private async _emit(level: string, data: string | Error): Promise<void> {
        const callStack = StackTrace.getSync();
        const callSite = callStack[4];
        let fileName = callSite.fileName != null ? new URL(callSite.fileName).pathname : this.name;
        let lineNumber = callSite.lineNumber || null;
        let columnNumber = callSite.columnNumber || null;

        if (fileName.includes("/js/")) {
            const sourceMapPath = `${callSite.fileName}.map`;

            const consumer = await getSourceMap(sourceMapPath);
            if (consumer != null) {
                const pos = consumer.originalPositionFor({ line: lineNumber, column: columnNumber });

                if (pos != null) {
                    _sourceMapsCache[fileName] = consumer;

                    fileName = (pos.source || fileName).replace("../../src/", "");
                    lineNumber = pos.line || lineNumber;
                    columnNumber = pos.column || columnNumber;
                }
            }
        }

        if (fileName.startsWith("/src/")) {
            fileName = fileName.replace("/src/", "");
        }

        let formattedMessage: string | null = null;
        if (data instanceof Error) {
            if (data.stack.startsWith("Error")) {
                formattedMessage = data.stack;
            } else {
                const stack = data.stack.split("\n").map((line) => `\tat ${line}`);
                formattedMessage = `Error: ${data.message}\n${stack.join("\n")}`;
            }
        } else {
            formattedMessage = data;
        }

        invoke("plugin:log|log", {
            level: toLogLevel(level),
            message: formattedMessage,
            location: `${fileName || this.name}${lineNumber ? `:${lineNumber}` : ""}`,
            file: fileName || this.name,
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
