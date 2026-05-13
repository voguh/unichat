/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { originalPositionFor, TraceMap, InvalidOriginalMapping, OriginalMapping } from "@jridgewell/trace-mapping";

import { Strings } from "unichat/utils/Strings";

export interface StackLine {
    caller: string;
    file: string;
    line: number;
    column: number;
}

const traceMapCache = new Map<string, TraceMap>();
async function getSourceMapConsumer(filePath: string): Promise<TraceMap | null> {
    if (traceMapCache.has(filePath)) {
        return traceMapCache.get(filePath)!;
    }

    const mapUrl = `${filePath}.map`;

    try {
        const res = await fetch(mapUrl);
        if (!res.ok) {
            return null;
        }

        const rawMap = await res.json();
        const map = new TraceMap(rawMap);
        traceMapCache.set(filePath, map);

        return map;
    } catch (error) {
        console.error(`Failed to load source map for ${filePath}:`, error);
        return null;
    }
}

function isInvalidOriginalMappingGuard(
    original: OriginalMapping | InvalidOriginalMapping
): original is InvalidOriginalMapping {
    return [original.source, original.line, original.column, original.name].every((value) => value == null);
}

async function mapCallSite(stackLine: StackLine): Promise<OriginalMapping | null> {
    const fileName = stackLine.file;
    const line = stackLine.line;
    const column = stackLine.column;
    if (!fileName || !line || !column) {
        return null;
    }

    const traceMap = await getSourceMapConsumer(fileName);
    if (!traceMap) {
        return null;
    }

    const original = originalPositionFor(traceMap, { line, column });
    if (isInvalidOriginalMappingGuard(original)) {
        return null;
    }

    return original;
}

function parseLines(stack: string | undefined): StackLine[] {
    const lines: StackLine[] = [];

    if (__PLATFORM__ === "windows") {
        // Assuming v8's stack trace format

        for (const line of (stack || "").split("\n")) {
            const match = line.match(/^\s*at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
            if (!match) {
                continue;
            }

            lines.push({
                caller: match[1] || "<anonymous>",
                file: match[2],
                line: parseInt(match[3], 10),
                column: parseInt(match[4], 10)
            });
        }
    } else {
        // Assuming JavaScriptCore's stack trace format

        for (const line of (stack || "").split("\n")) {
            const match = line.match(/^\s*(?:(.*?)@)?(.+?):(\d+):(\d+)\s*$/);
            if (!match) {
                continue;
            }

            lines.push({
                caller: match[1] || "<anonymous>",
                file: match[2],
                line: parseInt(match[3], 10),
                column: parseInt(match[4], 10)
            });
        }
    }

    return lines;
}

export class StackElements {
    public static async getStackTraceElement(callerIndex: number): Promise<StackLine> {
        const adjustedIndex = callerIndex + 1; // Skip the current function's stack frame

        const lines = parseLines(new Error().stack);
        const element = lines[adjustedIndex];

        if (!__IS_DEV__) {
            const mapped = await mapCallSite(element);
            if (mapped != null && !Strings.isNullOrEmpty(mapped.source)) {
                return {
                    caller: mapped.name || "<anonymous>",
                    file: mapped.source,
                    line: mapped.line,
                    column: mapped.column
                };
            }
        }

        return element;
    }
}
