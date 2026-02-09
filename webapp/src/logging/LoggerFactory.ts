/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
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
