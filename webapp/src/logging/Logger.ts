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

interface CallSite {
    __raw: string;
    functionName: string | null;
    fileName: string | null;
    lineNumber: number | null;
    columnNumber: number | null;
}

function initializeFunctionGuard(obj: any): obj is { initialize: (arg: Record<string, string>) => void } {
    return typeof obj.initialize === "function";
}

if (initializeFunctionGuard(SourceMapConsumer)) {
    SourceMapConsumer.initialize({ "lib/mappings.wasm": "/source-map/mappings.wasm" });
}

/* =====================================[ CODE EXTRACTED FROM TAURI PLUGIN LOG ]===================================== */
// The code below is adapted from the tauri-plugin-log guest-js implementation, the original code can be found here:
// https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/log/guest-js/index.ts

function getCallSite(): CallSite {
    const stack = new Error().stack || "";
    if (!stack) {
        return;
    }

    if (stack.startsWith("Error")) {
        // Assume it's Chromium V8
        //
        // Error
        //     at baz (filename.js:10:15)
        //     at bar (filename.js:6:3)
        //     at foo (filename.js:2:3)
        //     at filename.js:13:1

        const lines = stack.split("\n");
        // Find the third line (caller's caller of the current location)
        const callerLine = lines[3]?.trim();
        if (!callerLine) {
            return {
                __raw: "<unknown>",
                functionName: null,
                fileName: null,
                lineNumber: null,
                columnNumber: null
            };
        }

        const regex = /at\s+(?<functionName>.*?)\s+\((?<fileName>.*?):(?<lineNumber>\d+):(?<columnNumber>\d+)\)/;
        const match = callerLine.match(regex);

        if (match) {
            const { functionName, fileName: fileNameURL, lineNumber, columnNumber } = match.groups;
            const fileName = new URL(fileNameURL).pathname;

            return {
                __raw: callerLine,
                functionName: functionName || null,
                fileName: fileName || null,
                lineNumber: lineNumber != null ? parseInt(lineNumber, 10) : null,
                columnNumber: columnNumber != null ? parseInt(columnNumber, 10) : null
            };
        } else {
            // Handle cases where the regex does not match (e.g., last line without function name)
            const regexNoFunction = /at\s+(?<fileName>.*?):(?<lineNumber>\d+):(?<columnNumber>\d+)/;
            const matchNoFunction = callerLine.match(regexNoFunction);
            if (matchNoFunction) {
                const { fileName: fileNameURL, lineNumber, columnNumber } = matchNoFunction.groups;
                const fileName = new URL(fileNameURL).pathname;

                return {
                    __raw: callerLine,
                    functionName: "<anonymous>",
                    fileName: fileName || null,
                    lineNumber: lineNumber != null ? parseInt(lineNumber, 10) : null,
                    columnNumber: columnNumber != null ? parseInt(columnNumber, 10) : null
                };
            }

            return {
                __raw: callerLine,
                functionName: null,
                fileName: null,
                lineNumber: null,
                columnNumber: null
            };
        }
    } else {
        // Assume it's Webkit JavaScriptCore, example:
        //
        // baz@filename.js:10:24
        // bar@filename.js:6:6
        // foo@filename.js:2:6
        // global code@filename.js:13:4

        const traces = stack.split("\n").map((line) => line.split("@"));
        const filtered = traces.filter(([name, location]) => name.length > 0 && location !== "[native code]");
        // Find the third line (caller's caller of the current location)

        const callerLine = filtered[4];
        if (!callerLine) {
            return {
                __raw: "<unknown>",
                functionName: null,
                fileName: null,
                lineNumber: null,
                columnNumber: null
            };
        }

        const location = new URL(callerLine[1]).pathname;
        const [functionName, fileName, lineNumber, columnNumber] = [callerLine[0], ...location.split(":")];

        return {
            __raw: callerLine.join("@"),
            functionName: functionName || null,
            fileName: fileName || null,
            lineNumber: lineNumber ? parseInt(lineNumber, 10) : null,
            columnNumber: columnNumber ? parseInt(columnNumber, 10) : null
        };
    }
}
/* ===================================[ END CODE EXTRACTED FROM TAURI PLUGIN LOG ]=================================== */

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
        const callSite = getCallSite();
        let fileName = callSite.fileName;
        let lineNumber = callSite.lineNumber || null;
        let columnNumber = callSite.columnNumber || null;

        if (fileName != null && fileName.includes("assets")) {
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
