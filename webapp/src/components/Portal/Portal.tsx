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
    style?: PReact.CSSProperties;
    containerRef?: PReact.RefObject<HTMLElement | null>;
    children: PReact.ComponentChildren;
}

export function Portal({ children, containerRef, style }: Props): PReact.ComponentChildren {
    const portalId = useId();
    const portalElementRef = useRef<HTMLElement | null>(null);

    useLayoutEffect(() => {
        let el = portalElementRef.current ?? document.getElementById(portalId);
        if (el == null) {
            el = document.createElement("div");
            el.id = portalId;
            Object.assign(el.style, style ?? {});
            document.body.appendChild(el);
        }

        portalElementRef.current = el;
        if (containerRef != null) {
            containerRef.current = el;
        }

        return () => {
            if (el.childElementCount === 0) {
                el.remove();
            }
        };
    }, [portalId, containerRef]);

    useLayoutEffect(() => {
        const el = portalElementRef.current;
        if (!el) {
            return;
        }

        Object.assign(el.style, style ?? {});
    }, [style]);

    useLayoutEffect(() => {
        const el = portalElementRef.current;
        if (!el) {
            return;
        }

        PReact.render(children, el);

        return () => {
            PReact.render(null, el);
        };
    }, [children]);

    return null;
}
