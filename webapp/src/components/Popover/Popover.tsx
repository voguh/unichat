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

import { computePosition, flip, offset, Placement, shift } from "@floating-ui/dom";

import { useComputePosition } from "unichat/hooks/useComputePosition";
import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { Portal } from "../Portal";
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

    const [wrapperRef, tooltipRef, updateVisualization] = useComputePosition<Element, HTMLDivElement>({
        placement: placement || "top",
        middleware: [offset(8), flip(), shift({ padding: 8 })]
    });

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
