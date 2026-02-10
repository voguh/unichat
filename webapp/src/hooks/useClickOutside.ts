/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement = HTMLElement>(cb: (event?: Event) => void): React.RefObject<T> {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        function handler(event: Event): void {
            const el = ref.current;
            if (!el) {
                return;
            }

            if (event.target instanceof Node && el.contains(event.target)) {
                return;
            }

            cb(event);
        }

        document.addEventListener("pointerdown", handler);
        document.addEventListener("touchstart", handler);

        return () => {
            document.removeEventListener("pointerdown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, [cb]);

    return ref;
}
