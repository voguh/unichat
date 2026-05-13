/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Dispatch, StateUpdater, useEffect, useState } from "preact/hooks";

import { StorageChangeEvent, StorageEntry, storageService, StorageValues } from "unichat/services/storageService";

export function useStorage<K extends keyof StorageValues>(
    entry: StorageEntry<K>
): [StorageValues[K], Dispatch<StateUpdater<StorageValues[K]>>] {
    const [value, setValue] = useState(storageService.get(entry));

    function setLocalStorageValue(newValue: StateUpdater<StorageValues[K]>): void {
        const currentValue = storageService.get(entry);

        let finalValue: StorageValues[K];
        if (typeof newValue === "function") {
            finalValue = newValue(currentValue);
        } else {
            finalValue = newValue;
        }

        storageService.set(entry, finalValue);
    }

    useEffect(() => {
        function handler(event: StorageChangeEvent<K>): void {
            setValue(event.value);
        }

        const unlisten = storageService.onChange(entry, handler);

        return () => {
            unlisten();
        };
    }, []);

    return [value, setLocalStorageValue];
}
