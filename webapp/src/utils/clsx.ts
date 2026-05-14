/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Signalish } from "preact";

export type ClassPrimitive = string | number | bigint | symbol | null | undefined;
export type ClassDictionary = Record<string, boolean>;
export type ClassValue = ClassDictionary | ClassPrimitive | Signalish<ClassDictionary> | Signalish<ClassPrimitive>;

function isSignalish(value: any): value is Signalish<any> {
    if (value != null && typeof value === "object") {
        const hasValue = "value" in value;
        const hasPeek = "peek" in value && typeof value.peek === "function";
        const hasSubscribe = "subscribe" in value && typeof value.subscribe === "function";

        return hasValue && hasPeek && hasSubscribe;
    }

    return false;
}

export function clsx(...args: ClassValue[]): string {
    const str: string[] = [];

    for (const arg of args) {
        if (arg == null || typeof arg === "boolean") {
            continue;
        }

        if (typeof arg !== "object") {
            str.push(String(arg));
        } else if (!isSignalish(arg)) {
            for (const [key, enabled] of Object.entries(arg)) {
                if (enabled) {
                    str.push(key);
                }
            }
        }
    }

    return str.join(" ");
}
