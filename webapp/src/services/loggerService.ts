/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { debug, error, info, trace, warn } from "@tauri-apps/plugin-log";

export class LoggerService {
    public trace(message: string, ...args: any[]): void {
        const formattedMessage = this._formatMessage(message, ...args);
        trace(formattedMessage).catch((err) => console.error(err));
    }

    public debug(message: string, ...args: any[]): void {
        const formattedMessage = this._formatMessage(message, ...args);
        debug(formattedMessage).catch((err) => console.error(err));
    }

    public info(message: string, ...args: any[]): void {
        const formattedMessage = this._formatMessage(message, ...args);
        info(formattedMessage).catch((err) => console.error(err));
    }

    public warn(message: string, ...args: any[]): void {
        const formattedMessage = this._formatMessage(message, ...args);
        warn(formattedMessage).catch((err) => console.error(err));
    }

    public error(message: string, ...args: any[]): void {
        const formattedMessage = this._formatMessage(message, ...args);
        error(formattedMessage).catch((err) => console.error(err));

        if (args.at(-1) instanceof Error) {
            const lastArg = args.at(-1) as Error;
            error(lastArg.stack ?? lastArg.message).catch((err) => console.error(err));
        }
    }

    private _formatMessage(message: string, ...args: any[]): string {
        if (args.length > 0) {
            for (const arg of args) {
                if (arg instanceof Error) {
                    message = message.replace("{}", arg.message);
                } else {
                    message = message.replace("{}", String(arg));
                }
            }
        }

        return message;
    }
}

export const loggerService = new LoggerService();
