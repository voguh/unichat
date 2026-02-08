/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

export function randomColorBySeed(seed: string): string {
    let hash = 2166136261;

    for (const byte of new TextEncoder().encode(seed)) {
        hash ^= byte;
        hash = Math.imul(hash, 16777619);
        hash >>>= 0;
    }

    const r = (hash >> 16) & 0xff;
    const g = (hash >> 8) & 0xff;
    const b = hash & 0xff;

    const hR = r.toString(16).padStart(2, "0");
    const hG = g.toString(16).padStart(2, "0");
    const hB = b.toString(16).padStart(2, "0");

    return `#${hR}${hG}${hB}`.toUpperCase();
}
