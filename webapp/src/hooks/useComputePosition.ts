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
import { useEffect, useRef } from "preact/hooks";

import { autoUpdate, computePosition, FloatingElement, ReferenceElement } from "@floating-ui/dom";

export function useComputePosition<Reference extends ReferenceElement, Floating extends FloatingElement>(
    options?: Parameters<typeof computePosition>[2],
    adjustFloatingPosition?: (reference: Reference, floating: Floating, x: number, y: number) => [number, number]
): [RefObject<Reference>, RefObject<Floating>, (visible: boolean) => void] {
    const referenceRef = useRef<Reference>(null);
    const floatingRef = useRef<Floating>(null);
    const autoUpdateRef = useRef<() => void>(null);

    function toggleVisualization(visible: boolean): void {
        const referenceElem = referenceRef.current;
        const floatingElem = floatingRef.current;

        if (!referenceElem || !floatingElem) {
            return;
        }

        if (typeof autoUpdateRef.current === "function") {
            autoUpdateRef.current();
            autoUpdateRef.current = null;
        }

        if (!visible) {
            Object.assign(floatingElem.style, { visibility: "hidden", opacity: "0" });
        } else {
            Object.assign(floatingElem.style, { visibility: "visible", opacity: "1" });

            autoUpdateRef.current = autoUpdate(referenceElem, floatingElem, async () => {
                const { x, y } = await computePosition(referenceElem, floatingElem, options);

                if (typeof adjustFloatingPosition === "function") {
                    const [customX, customY] = adjustFloatingPosition(referenceElem, floatingElem, x, y);
                    Object.assign(floatingElem.style, { left: `${customX}px`, top: `${customY}px` });
                } else {
                    Object.assign(floatingElem.style, { left: `${x}px`, top: `${y}px` });
                }
            });
        }
    }

    useEffect(() => {
        return () => {
            if (typeof autoUpdateRef.current === "function") {
                autoUpdateRef.current();
            }
        };
    }, []);

    return [referenceRef, floatingRef, toggleVisualization];
}
