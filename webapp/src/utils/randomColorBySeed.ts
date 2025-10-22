/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
