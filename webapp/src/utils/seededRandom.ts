/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

export function seededRandom(seed: string): () => number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }

    return function () {
        h += h << 13;
        h ^= h >>> 7;
        h += h << 3;
        h ^= h >>> 17;
        h += h << 5;

        return Math.min((h >>> 0) / 4294967296 + Number.EPSILON, 1);
    };
}
