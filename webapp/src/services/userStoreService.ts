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

export class UserStoreService {
    public async getItem<T>(key: string): Promise<T> {
        return invoke("get_userstore", { key });
    }

    public async setItem<T>(key: string, value: T): Promise<void> {
        await invoke("set_userstore", { key, value });
    }
}

export const userStoreService = new UserStoreService();
