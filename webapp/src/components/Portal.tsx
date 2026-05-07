/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useId, useLayoutEffect, useRef } from "preact/hooks";

interface Props {
    initialStyle?: PReact.CSSProperties;
    containerRef?: PReact.RefObject<HTMLElement | null>;
    children: PReact.ComponentChildren;
}

export function Portal({ children, containerRef, initialStyle }: Props): PReact.ComponentChildren {
    const portalId = useId();
    const portalElementRef = useRef<HTMLElement | null>(null);

    useLayoutEffect(() => {
        let el = portalElementRef.current;
        if (el == null) {
            el = document.createElement("div");
            el.id = portalId;
            Object.assign(el.style, initialStyle ?? {});
            document.body.appendChild(el);

            portalElementRef.current = el;
            if (containerRef != null) {
                containerRef.current = el;
            }
        }

        return () => {
            PReact.render(null, el);

            portalElementRef.current = null;
            if (containerRef != null) {
                containerRef.current = null;
            }

            document.body.removeChild(el);
        };
    }, []);

    useLayoutEffect(() => {
        const el = portalElementRef.current;
        if (!el) {
            return;
        }

        PReact.render(children, el);
    }, [children]);

    return null;
}
