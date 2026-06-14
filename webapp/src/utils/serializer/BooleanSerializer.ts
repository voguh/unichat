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

export class NullishBooleanSerializer extends StorageSerializer<boolean | null> {
    public serialize(value: boolean | null | undefined): string {
        if (value == null) {
            return "null";
        } else if (typeof value === "boolean") {
            return value ? "true" : "false";
        } else {
            throw new TypeError(`Expected boolean or null value for serialization, got ${typeof value}.`);
        }
    }

    public deserialize(raw: string): boolean | null {
        if (raw === "null") {
            return null;
        } else if (raw === "true" || raw === "1") {
            return true;
        } else if (raw === "false" || raw === "0") {
            return false;
        } else {
            throw new TypeError(`Expected boolean string or "null" for deserialization, got ${raw}.`);
        }
    }
}

export class BooleanSerializer extends StorageSerializer<boolean> {
    public serialize(value: boolean): string {
        if (typeof value !== "boolean") {
            throw new TypeError(`Expected boolean value for serialization, got ${typeof value}.`);
        }

        return value ? "true" : "false";
    }

    public deserialize(raw: string): boolean {
        if (raw === "true" || raw === "1") {
            return true;
        } else if (raw === "false" || raw === "0") {
            return false;
        } else {
            throw new TypeError(`Expected boolean string for deserialization, got ${raw}.`);
        }
    }
}
