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

import { ComputePositionReturn, flip, offset, shift, Side } from "@floating-ui/dom";

import { Portal } from "unichat/components/Portal";
import { useComputePosition } from "unichat/hooks/useComputePosition";
import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { PopoverStyledContainer } from "./styled";

interface Props {
    children: PReact.VNode;

    trigger?: "hover" | "focus";
    placement?: Side;
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
    const dialogCaretElem = floating.querySelector<HTMLDivElement>(".popover-caret");
    if (dialogCaretElem != null) {
        const bounds = reference.getBoundingClientRect();

        dialogCaretElem.setAttribute("data-placement", placement);
        if (placement === "top" || placement === "bottom") {
            dialogCaretElem.style.left = `${bounds.x + bounds.width / 2}px`;
            dialogCaretElem.style.top = placement === "top" ? `${bounds.y}px` : `${bounds.y + bounds.height}px`;
        } else if (placement === "left" || placement === "right") {
            dialogCaretElem.style.left = placement === "left" ? `${bounds.x}px` : `${bounds.x + bounds.width}px`;
            dialogCaretElem.style.top = `${bounds.y + bounds.height / 2}px`;
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
