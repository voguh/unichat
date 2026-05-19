/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { computePosition, flip, offset, Placement, shift, Side } from "@floating-ui/dom";

import { TourBuilder } from "../Tour";

export const ELEMENT_PADDING = 4;

export function stageBuilder(
    selector: string,
    title: string,
    subTitle: string | null,
    placement: Side,
    ignorePrefix = false
): TourBuilder {
    return async function (container) {
        container.innerHTML = "";

        const dataTourItem = document.querySelector(ignorePrefix ? selector : `[data-tour='${selector}']`);
        if (!dataTourItem) {
            return;
        }

        const bounds = dataTourItem.getBoundingClientRect();
        const x1 = bounds.x - ELEMENT_PADDING;
        const y1 = bounds.y - ELEMENT_PADDING;
        const x2 = bounds.x + bounds.width + ELEMENT_PADDING;
        const y2 = bounds.y + bounds.height + ELEMENT_PADDING;

        const overlay = document.createElement("div");
        overlay.classList.add("tour-backdrop");
        const clip = `polygon(evenodd,
            0 0, 100% 0, 100% 100%, 0 100%, 0 0,
            ${x1}px ${y1}px, ${x2}px ${y1}px, ${x2}px ${y2}px, ${x1}px ${y2}px, ${x1}px ${y1}px
        )`;
        overlay.style.clipPath = clip;
        container.appendChild(overlay);

        const highlight = document.createElement("div");
        highlight.classList.add("tour-highlight");
        highlight.style.left = `${x1}px`;
        highlight.style.top = `${y1}px`;
        highlight.style.width = `${x2 - x1}px`;
        highlight.style.height = `${y2 - y1}px`;
        container.appendChild(highlight);

        /* ========================================================================================================== */

        const dialogElem = document.createElement("div");
        dialogElem.classList.add("tour-dialog");
        container.appendChild(dialogElem);

        const dialogCaretElem = document.createElement("div");
        dialogCaretElem.classList.add("tour-dialog-caret");
        dialogElem.appendChild(dialogCaretElem);

        const dialogTitleElem = document.createElement("div");
        dialogTitleElem.classList.add("tour-dialog-title");
        dialogTitleElem.innerHTML = title;
        dialogElem.appendChild(dialogTitleElem);

        if (subTitle) {
            const dialogSubTitleElem = document.createElement("div");
            dialogSubTitleElem.classList.add("tour-dialog-subtitle");
            dialogSubTitleElem.innerHTML = subTitle;
            dialogElem.appendChild(dialogSubTitleElem);
        }

        const { x, y } = await computePosition(dataTourItem, dialogElem, {
            placement: placement as Placement,
            middleware: [offset(8), flip(), shift({ padding: 8 })]
        });

        dialogElem.style.visibility = "visible";
        dialogElem.style.opacity = "1";
        dialogElem.style.left = `${x}px`;
        dialogElem.style.top = `${y}px`;

        dialogCaretElem.setAttribute("data-placement", placement);
        if (placement === "top" || placement === "bottom") {
            dialogCaretElem.style.left = `${bounds.x + bounds.width / 2}px`;
            dialogCaretElem.style.top = placement === "top" ? `${bounds.y}px` : `${bounds.y + bounds.height}px`;
        } else if (placement === "left" || placement === "right") {
            dialogCaretElem.style.left = placement === "left" ? `${bounds.x}px` : `${bounds.x + bounds.width}px`;
            dialogCaretElem.style.top = `${bounds.y + bounds.height / 2}px`;
        }
    };
}
