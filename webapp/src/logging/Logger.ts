/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import * as tauriLogger from "@tauri-apps/plugin-log";

export class Logger {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    public trace(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        this._dispatchLog("trace", formatted);

        if (throwable) {
            this._dispatchThrowable(throwable);
        }
    }

    public debug(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        this._dispatchLog("debug", formatted);

        if (throwable) {
            this._dispatchThrowable(throwable);
        }
    }

    public info(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        this._dispatchLog("info", formatted);

        if (throwable) {
            this._dispatchThrowable(throwable);
        }
    }

    public warn(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        this._dispatchLog("warn", formatted);

        if (throwable) {
            this._dispatchThrowable(throwable);
        }
    }

    public error(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        this._dispatchLog("error", formatted);

        if (throwable) {
            this._dispatchThrowable(throwable);
        }
    }

    private _dispatchLog(level: string, message: string): void {
        if (!["trace", "debug", "info", "warn", "error"].includes(level)) {
            level = "info";
        }

        tauriLogger[level](`[${this.name}] ${message}`).catch(console.error);
        console[level](message);
    }

    private _dispatchThrowable(throwable: Error): void {
        tauriLogger.error(`[${this.name}] ${throwable.stack}`).catch(console.error);
        console.error(throwable);
    }

    private _formatMessage(message: string, args: any[]): { formatted: string; throwable: Error | null } {
        let throwable: Error | null = null;
        let usedArgs = args;

        if (args.length > 0 && args[args.length - 1] instanceof Error) {
            throwable = args[args.length - 1];
            usedArgs = args.slice(0, -1);
        }

        let formatted = message;
        for (const arg of usedArgs) {
            formatted = formatted.replace("{}", String(arg));
        }

        return { formatted, throwable };
    }
}
