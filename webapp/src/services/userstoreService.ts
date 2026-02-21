/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { invoke } from "@tauri-apps/api/core";

export class UserstoreService {
    public async getItems(prefix: string): Promise<Record<string, any>> {
        return invoke("userstore_get_items", { prefix });
    }

    public async getItem<T>(key: string): Promise<T> {
        return invoke("userstore_get_item", { key });
    }

    public async setItems(items: Record<string, any>): Promise<void> {
        await invoke("userstore_set_items", { items });
    }

    public async setItem<T>(key: string, value: T): Promise<void> {
        await invoke("userstore_set_item", { key, value });
    }
}

export const userstoreService = new UserstoreService();
