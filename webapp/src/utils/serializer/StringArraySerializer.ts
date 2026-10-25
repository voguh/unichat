/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { StorageSerializer } from "./StorageSerializer";

export class StringArraySerializer extends StorageSerializer<string[]> {
    public serialize(value: string[]): string {
        if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
            throw new TypeError("Expected string array value for serialization.");
        }

        return JSON.stringify(value);
    }

    public deserialize(raw: string): string[] {
        const value: unknown = JSON.parse(raw);
        if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
            throw new TypeError(`Expected string array JSON for deserialization, got ${raw}.`);
        }

        return value;
    }
}
