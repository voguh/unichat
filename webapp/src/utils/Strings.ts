/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

export class Strings {
    constructor() {
        throw new Error("Strings is a static class and cannot be instantiated.");
    }

    /**
     * Validates if the value is null, undefined, or an empty string.
     *
     * @param {string | null | undefined} value Value to check.
     * @returns {boolean} Returns true if value is not a string or if trimmed string length is zero.
     */
    public static isNullOrEmpty(value: string | null | undefined): value is null | undefined {
        if (typeof value !== "string") {
            return true;
        }

        return (value ?? "").trim().length === 0;
    }

    /**
     * Uses {@link Strings.isNullOrEmpty} and throws if result is true, otherwise returns the string.
     *
     * @param {string | null | undefined} str String to validate.
     * @param {string} [message] Optional error message.
     * @returns {string} The validated string.
     * @throws {TypeError} If the string is null or undefined.
     */
    public static requireNonNull(str: string | null | undefined, message?: string): string {
        if (this.isNullOrEmpty(str)) {
            throw new TypeError(message ?? "Required string is null or undefined.");
        }

        return str;
    }

    /**
     * Normalizes a given path by joining the base path with additional segments,
     * removing redundant slashes, and ensuring there are no trailing slashes
     * (except for the root path).
     *
     * @param basePath The base path to normalize.
     * @param parts Additional path segments to append to the base path.
     * @returns The normalized path.
     */
    public static normalizePath(basePath: string, ...parts: string[]): string {
        let joinedPath = basePath;

        for (const part of parts ?? []) {
            if (!Strings.isNullOrEmpty(part)) {
                joinedPath += `/${part}`;
            }
        }

        const normalizedPath = joinedPath.replace(/\/+/g, "/");

        if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
            return normalizedPath.slice(0, -1);
        } else if (normalizedPath.length < 1) {
            return "/";
        }

        return normalizedPath;
    }
}
