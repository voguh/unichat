/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

export function exposeItem(name: string, item: any): void {
    if (!("__MODULES__" in globalThis)) {
        Object.defineProperty(globalThis, "__MODULES__", {
            value: {},
            writable: false,
            configurable: false,
            enumerable: true
        });
    }

    window.__MODULES__[name] = item;
}

export function exposeModules(prefix: string, modules: Record<string, any>): void {
    const prefixParts = prefix.split("/");

    for (const [path, mod] of Object.entries(modules)) {
        const pathParts = path.split("/");
        if (pathParts[0] === "." && pathParts[1] === prefixParts[1]) {
            pathParts.shift();
            pathParts.shift();
        }

        const clean = pathParts
            .join("/")
            .replace(/\.(tsx?|jsx?)$/, "")
            .replace(/\/index$/, "");

        let fullPath = `${prefix}/${clean}`.replace(/\/+/g, "/");
        if (fullPath.endsWith("/")) {
            fullPath = fullPath.slice(0, -1);
        }

        if (fullPath.startsWith("/")) {
            fullPath = fullPath.slice(1);
        }

        exposeItem(fullPath, mod);
    }
}
