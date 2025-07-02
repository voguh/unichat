/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
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
    }

    private _formatMessage(message: string, ...args: any[]): string {
        if (args.length > 0) {
            for (const arg of args) {
                message.replace("{}", String(arg));
            }
        }

        return message;
    }
}

export const loggerService = new LoggerService();
