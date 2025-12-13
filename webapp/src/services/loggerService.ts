/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { debug, error, info, trace, warn } from "@tauri-apps/plugin-log";

export class Logger {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    public trace(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        trace(formatted, { file: this.name }).catch(console.error);
        console.trace(formatted);

        if (throwable) {
            error(throwable.stack, { file: this.name }).catch(console.error);
            console.error(throwable);
        }
    }

    public debug(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        debug(formatted, { file: this.name }).catch(console.error);
        console.debug(formatted);

        if (throwable) {
            error(throwable.stack, { file: this.name }).catch(console.error);
            console.error(throwable);
        }
    }

    public info(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        info(formatted, { file: this.name }).catch(console.error);
        console.info(formatted);

        if (throwable) {
            error(throwable.stack, { file: this.name }).catch(console.error);
            console.error(throwable);
        }
    }

    public warn(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        warn(formatted, { file: this.name }).catch(console.error);
        console.warn(formatted);

        if (throwable) {
            error(throwable.stack, { file: this.name }).catch(console.error);
            console.error(throwable);
        }
    }

    public error(message: string, ...args: any[]): void {
        const { formatted, throwable } = this._formatMessage(message, args);
        error(formatted, { file: this.name }).catch(console.error);
        console.error(formatted);

        if (throwable) {
            error(throwable.stack, { file: this.name }).catch(console.error);
            console.error(throwable);
        }
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

export class LoggerFactory {
    constructor() {
        throw new Error("LoggerFactory is a static class and cannot be instantiated.");
    }

    public static getLogger(name: string): Logger {
        return new Logger(name);
    }
}

/** @deprecated use {@link LoggerFactory.getLogger} instead. */
export const loggerService = LoggerFactory.getLogger(import.meta.url);
