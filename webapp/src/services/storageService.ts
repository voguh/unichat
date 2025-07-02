/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

import { invoke } from "@tauri-apps/api/core";

import { loggerService } from "./loggerService";

export class StorageService {
    private readonly _listeners: Map<string, ((key: string, value: any) => void)[]>;

    constructor() {
        this._listeners = new Map();
    }

    public async getItem<T>(key: string): Promise<T> {
        try {
            return invoke<T>("store_get_item", { key });
        } catch (err) {
            loggerService.error("An error occurred while getting item from storage: {}", err);

            return null;
        }
    }

    public async setItem<T>(key: string, value: T): Promise<void> {
        try {
            const listeners = this._listeners.get(key);
            for (const listener of listeners ?? []) {
                listener(key, value);
            }

            return invoke<void>("store_set_item", { key, value });
        } catch (err) {
            loggerService.error("An error occurred while setting item in storage: {}", err);
        }
    }

    public addEventListener<T>(key: string, cb: (key: string, value: T) => void): void {
        let listeners = this._listeners.get(key);
        if (listeners == null) {
            listeners = [];
        }

        listeners.push(cb);

        this._listeners.set(key, listeners);
    }

    public removeEventListener<T>(key: string, cb: (key: string, value: T) => void): void {
        let listeners = this._listeners.get(key);

        if (listeners != null) {
            listeners = listeners.filter((item) => item !== cb);
        }

        this._listeners.set(key, listeners);
    }
}

export const storageService = new StorageService();
