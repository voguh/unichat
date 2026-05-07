/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import mitt from "mitt";

import { BooleanSerializer } from "./BooleanSerializer";
import { StorageSerializer } from "./StorageSerializer";

export interface StorageValues {
    "show-widget-preview": boolean;
    "requires-restart": boolean;
}

type Value<K extends keyof StorageValues> = StorageValues[K];
export type StorageEntry<K extends keyof StorageValues> = readonly [K, StorageSerializer<Value<K>>, Value<K>];
function buildEntry<K extends keyof StorageValues>(
    key: K,
    serializer: StorageSerializer<Value<K>>,
    defaultValue: Value<K>
): StorageEntry<K> {
    return Object.freeze([key, serializer, defaultValue]);
}

export const StorageKeys = Object.freeze({
    SHOW_WIDGET_PREVIEW: buildEntry("show-widget-preview", new BooleanSerializer(), true),
    REQUIRES_RESTART: buildEntry("requires-restart", new BooleanSerializer(), false)
});

const StorageEntries = new Set(Object.values(StorageKeys));
function checkStorageEntry<K extends keyof StorageValues>(entry: StorageEntry<K>): void {
    if (entry == null) {
        throw new TypeError(`Unknown SessionStorage entry.`);
    }

    if (!StorageEntries.has(entry as StorageEntry<keyof StorageValues>)) {
        throw new TypeError(`Unknown SessionStorage entry "${entry[0]}".`);
    }
}

/* ========================================================================== */

export type StorageChangeEventHandler<K extends keyof StorageValues> = (event: StorageChangeEvent<K>) => void;
export interface StorageChangeEvent<K extends keyof StorageValues> {
    key: K;
    value: StorageValues[K];
}

type StorageEvents = {
    "storage:change": StorageChangeEvent<keyof StorageValues>;
};

const storageListener = mitt<StorageEvents>();

/* ========================================================================== */

const PREFIX = "unichat";
class StorageService {
    public static get PREFIX(): string {
        return PREFIX;
    }

    public get<K extends keyof StorageValues>(entry: StorageEntry<K>): StorageValues[K] {
        checkStorageEntry(entry);

        const [key, serializer, defaultValue] = entry;
        const prefixedKey = `${PREFIX}:${key}`;

        const raw = sessionStorage.getItem(prefixedKey);
        if (raw == null) {
            return defaultValue;
        }

        try {
            return serializer.deserialize(raw);
        } catch (error) {
            console.warn(`Failed to deserialize SessionStorage entry "${key}". Using default value.`, error);
            return defaultValue;
        }
    }

    public set<K extends keyof StorageValues>(entry: StorageEntry<K>, value: StorageValues[K]): void {
        checkStorageEntry(entry);

        const [key, serializer] = entry;
        const prefixedKey = `${PREFIX}:${key}`;

        try {
            const raw = serializer.serialize(value);
            const currentRaw = sessionStorage.getItem(prefixedKey);
            if (currentRaw === raw) {
                return;
            }

            sessionStorage.setItem(prefixedKey, raw);
            storageListener.emit("storage:change", { key, value });
        } catch (error) {
            console.error(`Failed to serialize SessionStorage entry "${key}". Value not saved.`, error);
        }
    }

    public onChange<K extends keyof StorageValues>(
        entry: StorageEntry<K>,
        handler: StorageChangeEventHandler<K>
    ): () => void {
        checkStorageEntry(entry);

        const [key] = entry;

        function handlerWrapper(event: StorageChangeEvent<keyof StorageValues>): void {
            if (event.key === key) {
                handler(event as StorageChangeEvent<K>);
            }
        }

        storageListener.on("storage:change", handlerWrapper);

        return () => {
            storageListener.off("storage:change", handlerWrapper);
        };
    }
}

export const storageService = new StorageService();
