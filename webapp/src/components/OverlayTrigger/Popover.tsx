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

import { Portal } from "../Portal";
import { PopoverStyledContainer } from "./styled";

interface Props {
    children: PReact.VNode;

    placement?: Placement;
    title?: PReact.ComponentChildren;
    content: PReact.ComponentChildren;

    style?: PReact.CSSProperties;
    headerStyle?: PReact.CSSProperties;
    bodyStyle?: PReact.CSSProperties;
}

export function Popover(props: Props): PReact.ComponentChildren {
    const { children, content, bodyStyle, headerStyle, placement, style, title } = props;

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

    function captureRef(el: Element | PReact.Component | null): void {
        if (el instanceof Element) {
            wrapperRef.current = el;
        } else if (el != null) {
            if ("base" in el && el.base instanceof Element) {
                wrapperRef.current = el.base;
            } else {
                throw new Error("Tooltip trigger must be an Element or a Component that forwards ref to an Element");
            }
        }
    }

    const trigger = PReact.cloneElement(children, {
        ref: captureRef,
        onMouseEnter: show,
        onMouseLeave: hide
    });

    return (
        <>
            {trigger}
            <Portal
                containerRef={tooltipRef}
                style={{
                    position: "absolute",
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
