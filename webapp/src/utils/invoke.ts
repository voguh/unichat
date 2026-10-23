/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { type InvokeArgs, type InvokeOptions, invoke as tauriInvoke } from "@tauri-apps/api/core";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

const _logger = LoggerFactory.getLogger("invoke");
export async function invoke<T>(cmd: string, args?: InvokeArgs, options?: InvokeOptions): Promise<T> {
    try {
        const result = await tauriInvoke<T>(cmd, args, options);

        return result;
    } catch (error) {
        _logger.error("Error invoking command: {}", String(error), error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(String(error));
        }
    }
}
