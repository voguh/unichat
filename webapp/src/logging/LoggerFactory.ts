/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { Logger } from "./Logger";

export class LoggerFactory {
    constructor() {
        throw new Error("LoggerFactory is a static class and cannot be instantiated.");
    }

    public static getLogger(name: string): Logger {
        return new Logger(name);
    }
}
