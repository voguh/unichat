/*!******************************************************************************
 * UniChat
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

export class Strings {
    public static isNullOrEmpty(s: string): boolean {
        return s == null || s.trim().length === 0;
    }
}
