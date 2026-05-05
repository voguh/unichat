/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Dispatch, StateUpdater, useEffect, useId, useState } from "preact/hooks";

import mitt from "mitt";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

export enum StorageKeys {
    SHOW_WIDGET_PREVIEW = "show-widget-preview",
    REQUIRES_RESTART = "requires-restart"
}

interface LocalStorageValues {
    "show-widget-preview": boolean;
    "requires-restart": boolean;
}

interface LocalStorageChangeEvent<K extends keyof LocalStorageValues = keyof LocalStorageValues> {
    dispatcherId: string;
    key: K;
    value: LocalStorageValues[K] | null;
}

type LocalStorageEvent = {
    "local_storage:change": LocalStorageChangeEvent;
};

const localStorageListener = mitt<LocalStorageEvent>();
const PREFIX = "unichat";

const _logger = LoggerFactory.getLogger("useLocalStorage");
export function useLocalStorage<K extends keyof LocalStorageValues>(
    key: K,
    defaultValue: LocalStorageValues[K]
): [LocalStorageValues[K], Dispatch<StateUpdater<LocalStorageValues[K]>>] {
    const listenerId = useId();
    const prefixedKey = `${PREFIX}:${key}`;

    const [value, setValue] = useState<LocalStorageValues[K]>(() => {
        try {
            const stored = localStorage.getItem(prefixedKey);
            if (stored == null || ["", "undefined", "null"].includes(stored)) {
                throw new Error(`No value found in localStorage for key "${prefixedKey}"`);
            }

            return JSON.parse(stored);
        } catch (error) {
            _logger.error(`Parse error for key "${key}":`, error);
        }

        return defaultValue;
    });

    function setLocalStorageValue(newValue: StateUpdater<LocalStorageValues[K]>): void {
        setValue((oldValue) => {
            let finalValue: LocalStorageValues[K];
            if (newValue instanceof Function) {
                finalValue = newValue(oldValue);
            } else {
                finalValue = newValue;
            }

            localStorage.setItem(prefixedKey, JSON.stringify(finalValue));
            localStorageListener.emit("local_storage:change", {
                dispatcherId: listenerId,
                key,
                value: finalValue
            });

            return finalValue;
        });
    }

    useEffect(() => {
        function handler(event: LocalStorageChangeEvent): void {
            if (event.dispatcherId !== listenerId && event.key === key) {
                setValue(event.value ?? defaultValue);
            }
        }

        localStorageListener.on("local_storage:change", handler);
        return () => localStorageListener.off("local_storage:change", handler);
    }, []);

    return [value, setLocalStorageValue];
}
