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
import { useLayoutEffect, useMemo } from "preact/hooks";

interface Props {
    id?: string;
    style?: PReact.CSSProperties;
    containerRef?: PReact.RefObject<Element | null>;
    children: PReact.ComponentChildren;
}

export function Portal({ children, containerRef, id, style }: Props): PReact.ComponentChildren {
    const portalId = useMemo(() => id || `unichat-portal-${Math.random().toString(16).slice(2)}`, [id]);

    useLayoutEffect(() => {
        const existing = document.getElementById(portalId);
        const el = existing ?? document.createElement("div");

        if (!existing) {
            el.id = portalId;
            document.body.appendChild(el);
        }

        Object.assign(el.style, style ?? {});
        if (containerRef != null) {
            containerRef.current = el;
        }
        PReact.render(children, el);

        return () => {
            PReact.render(null, el);
            if (el.childElementCount === 0) {
                el.remove();
            }
        };
    }, [children, style, portalId]);

    return null;
}
