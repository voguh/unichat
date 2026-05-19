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

import { offset, flip, shift, ComputePositionReturn, Placement } from "@floating-ui/dom";

import { Portal } from "unichat/components/Portal";
import { useComputePosition } from "unichat/hooks/useComputePosition";
import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { TooltipStyledContainer } from "./styled";

interface Props {
    maxWidth?: number;
    placement?: Placement;
    content: PReact.ComponentChildren;
    children: PReact.VNode;
}

function adjustFloatingPosition(
    reference: Element,
    floating: HTMLElement,
    { placement, x, y }: ComputePositionReturn
): [number, number] {
    const caretElem = floating.querySelector<HTMLDivElement>(".tooltip-caret");
    if (caretElem != null) {
        const bounds = reference.getBoundingClientRect();

        caretElem.setAttribute("data-placement", placement);
        const isTop = placement.startsWith("top");
        const isRight = placement.startsWith("right");
        const isBottom = placement.startsWith("bottom");
        const isLeft = placement.startsWith("left");
        if (isTop || isBottom) {
            caretElem.style.left = `${bounds.x + bounds.width / 2}px`;
            caretElem.style.top = isTop ? `${bounds.y}px` : `${bounds.y + bounds.height}px`;
        } else if (isLeft || isRight) {
            caretElem.style.left = isLeft ? `${bounds.x}px` : `${bounds.x + bounds.width}px`;
            caretElem.style.top = `${bounds.y + bounds.height / 2}px`;
        }
    }

    return [x, y];
}

export function Tooltip({ children, content, maxWidth, placement }: Props): PReact.ComponentChildren {
    const resolvedPlacement = placement || "top";

    const [wrapperRef, tooltipRef, updateVisualization] = useComputePosition<Element, HTMLDivElement>(
        {
            placement: resolvedPlacement,
            middleware: [offset(8), flip(), shift({ padding: 8 })]
        },
        adjustFloatingPosition
    );

    function show(): void {
        updateVisualization(true);
    }

    function hide(): void {
        updateVisualization(false);
    }

    const triggerElement = PReact.cloneElement(children, {
        ref: captureNativeRef(Element, wrapperRef),

        onMouseEnter: show,
        onMouseLeave: hide
    });

    return (
        <>
            {triggerElement}
            <Portal
                containerRef={tooltipRef}
                initialStyle={{
                    position: "fixed",
                    visibility: "hidden",
                    opacity: "0",
                    pointerEvents: "none"
                }}
            >
                <TooltipStyledContainer data-placement={resolvedPlacement} style={{ maxWidth: maxWidth ?? "300px" }}>
                    <div className="tooltip-caret" />
                    <div className="tooltip-content">{content}</div>
                </TooltipStyledContainer>
            </Portal>
        </>
    );
}
