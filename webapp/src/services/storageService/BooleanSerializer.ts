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

export class BooleanSerializer extends StorageSerializer<boolean> {
    public serialize(value: boolean): string {
        if (typeof value !== "boolean") {
            throw new TypeError(`Expected boolean value for serialization, got ${typeof value}.`);
        }

        return value ? "true" : "false";
    }

    public deserialize(raw: string): boolean {
        if (["true", "1"].includes(raw)) {
            return true;
        } else if (["false", "0"].includes(raw)) {
            return false;
        } else {
            throw new TypeError(`Expected boolean string for deserialization, got ${raw}.`);
        }
    }
}
