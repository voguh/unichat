/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { RefObject } from "preact";

export function clickOutside(cb: (event?: Event) => void, ...elements: RefObject<Element>[]): () => void {
    if (!elements.every((el) => el != null && "current" in el)) {
        throw new TypeError("All elements must be ref-like objects with a 'current' property.");
    }

    function handler(event: Event): void {
        if (!(event.target instanceof Node)) {
            return;
        }

        for (const ref of elements) {
            if (ref.current?.contains(event.target)) {
                return;
            }
        }

        cb(event);
    }

    document.addEventListener("pointerdown", handler, true);

    return () => {
        document.removeEventListener("pointerdown", handler, true);
    };
}
