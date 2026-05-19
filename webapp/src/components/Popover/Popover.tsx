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

import { ComputePositionReturn, flip, offset, Placement, shift } from "@floating-ui/dom";

import { Portal } from "unichat/components/Portal";
import { useComputePosition } from "unichat/hooks/useComputePosition";
import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { PopoverStyledContainer } from "./styled";

interface Props {
    children: PReact.VNode;

    trigger?: "hover" | "focus";
    placement?: Placement;
    title?: PReact.ComponentChildren;
    content: PReact.ComponentChildren;

    style?: PReact.CSSProperties;
    headerStyle?: PReact.CSSProperties;
    bodyStyle?: PReact.CSSProperties;
}

function adjustFloatingPosition(
    reference: Element,
    floating: HTMLElement,
    { placement, x, y }: ComputePositionReturn
): [number, number] {
    const caretElem = floating.querySelector<HTMLDivElement>(".popover-caret");
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

export function Popover({
    children,
    content,
    bodyStyle,
    headerStyle,
    placement,
    style,
    title,
    trigger = "hover"
}: Props): PReact.ComponentChildren {
    const resolvedPlacement = placement || "top";

    const [wrapperRef, tooltipRef, updateVisualization] = useComputePosition<Element, HTMLDivElement>(
        {
            placement: placement || "top",
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

        onMouseEnter: trigger === "hover" ? show : undefined,
        onMouseLeave: trigger === "hover" ? hide : undefined,

        onFocus: trigger === "focus" ? show : undefined,
        onBlur: trigger === "focus" ? hide : undefined
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
                <PopoverStyledContainer data-placement={resolvedPlacement} style={style}>
                    <div className="popover-caret" />
                    {title && (
                        <div className="popover-header" style={headerStyle}>
                            {title}
                        </div>
                    )}
                    <div className="popover-body" style={bodyStyle}>
                        {content}
                    </div>
                </PopoverStyledContainer>
            </Portal>
        </>
    );
}
