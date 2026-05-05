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
import { useRef } from "preact/hooks";

import { computePosition, offset, flip, shift, Placement } from "@floating-ui/dom";

import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { Portal } from "../Portal";
import { TooltipStyledContainer } from "./styled";

interface Props {
    maxWidth?: number;
    placement?: Placement;
    content: PReact.ComponentChildren;
    children: PReact.VNode;
}

export function Tooltip({ children, content, maxWidth, placement }: Props): PReact.ComponentChildren {
    const wrapperRef = useRef<Element>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const resolvedPlacement = placement || "top";

    async function updatePosition(visible: boolean): Promise<void> {
        if (!wrapperRef.current || !tooltipRef.current) {
            return;
        }

        if (!visible) {
            Object.assign(tooltipRef.current.style, {
                visibility: "hidden",
                opacity: "0",
                left: "0",
                top: "0"
            });
            return;
        }

        const { x, y } = await computePosition(wrapperRef.current, tooltipRef.current, {
            placement: resolvedPlacement,
            middleware: [offset(8), flip(), shift({ padding: 8 })]
        });

        Object.assign(tooltipRef.current.style, {
            visibility: "visible",
            opacity: "1",
            left: `${x}px`,
            top: `${y}px`
        });
    }

    function show(): void {
        updatePosition(true);
    }

    function hide(): void {
        updatePosition(false);
    }

    const trigger = PReact.cloneElement(children, {
        ref: captureNativeRef(Element, wrapperRef),

        onMouseEnter: show,
        onMouseLeave: hide
    });

    return (
        <>
            {trigger}
            <div
                ref={tooltipRef}
                style={{
                    zIndex: 9998,
                    position: "fixed",
                    visibility: "hidden",
                    opacity: "0",
                    pointerEvents: "none"
                }}
            >
                <TooltipStyledContainer data-placement={resolvedPlacement} style={{ maxWidth: maxWidth ?? "300px" }}>
                    {content}
                </TooltipStyledContainer>
            </div>
        </>
    );
}
