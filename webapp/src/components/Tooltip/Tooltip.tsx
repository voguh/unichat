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

import { offset, flip, shift, Placement } from "@floating-ui/dom";

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

export function Tooltip({ children, content, maxWidth, placement }: Props): PReact.ComponentChildren {
    const resolvedPlacement = placement || "top";

    const [wrapperRef, tooltipRef, updateVisualization] = useComputePosition<Element, HTMLDivElement>({
        placement: resolvedPlacement,
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
                    {content}
                </TooltipStyledContainer>
            </Portal>
        </>
    );
}
