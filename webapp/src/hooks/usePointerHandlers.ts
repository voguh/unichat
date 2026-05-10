/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { TargetedPointerEvent } from "preact";
import { Dispatch, useRef } from "preact/hooks";

export type PointerHandler<T extends Element> = Dispatch<TargetedPointerEvent<T>>;
export interface PointerHandlers<T extends Element> {
    onPointerDown: PointerHandler<T>;
    onPointerMove: PointerHandler<T>;
    onPointerUp: PointerHandler<T>;
}

export function usePointerHandlers<T extends Element>(callback: PointerHandler<T>): PointerHandlers<T> {
    const dragging = useRef(false);

    function onPointerDown(event: TargetedPointerEvent<T>): void {
        const element = event.currentTarget;

        dragging.current = true;
        element.setPointerCapture(event.pointerId);
        callback(event);
    }

    function onPointerMove(event: TargetedPointerEvent<T>): void {
        if (!dragging.current) {
            return;
        }

        callback(event);
    }

    function onPointerUp(event: TargetedPointerEvent<T>): void {
        const element = event.currentTarget;

        dragging.current = false;
        element.releasePointerCapture(event.pointerId);
    }

    return { onPointerDown, onPointerMove, onPointerUp };
}
