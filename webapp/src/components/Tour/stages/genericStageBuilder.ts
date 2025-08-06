/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { Strings } from "unichat/utils/Strings";

import { BACKDROP_COLOR, INDICATORS_COLOR, TourStage } from "../Tour";

export function stageBuilder(selector: string, title: string, subTitle: string, vLine = 50, hLine = 300): TourStage {
    return (svg, dimensions) => {
        svg.innerHTML = "";

        const dataTourItem = document.querySelector(`[data-tour='${selector}']`);
        if (!dataTourItem) {
            return;
        }

        const bounds = dataTourItem.getBoundingClientRect();

        const backdrop = document.createElementNS("http://www.w3.org/2000/svg", "path");
        backdrop.setAttribute("fill", BACKDROP_COLOR);
        backdrop.setAttribute("fill-rule", "evenodd");
        backdrop.setAttribute(
            "d",
            [
                "M 0 0",
                `H ${dimensions.width}`,
                `V ${dimensions.height}`,
                "H 0",
                "Z",
                `M ${bounds.x - 7} ${bounds.y - 7}`,
                `H ${bounds.x + bounds.width + 7}`,
                `V ${bounds.y + bounds.height + 7}`,
                `H ${bounds.x - 7}`,
                "Z"
            ].join(" ")
        );
        svg.appendChild(backdrop);

        /* ========================================================================================================== */

        const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        border.setAttribute("x", `${bounds.x - 8}`);
        border.setAttribute("y", `${bounds.y - 8}`);
        border.setAttribute("width", `${bounds.width + 16}`);
        border.setAttribute("height", `${bounds.height + 16}`);
        border.setAttribute("fill", "transparent");
        border.setAttribute("stroke", INDICATORS_COLOR);
        border.setAttribute("stroke-width", "2");
        border.setAttribute("rx", "4");
        border.setAttribute("ry", "4");
        svg.appendChild(border);

        /* ========================================================================================================== */

        const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowPath.setAttribute("fill", "none");
        arrowPath.setAttribute("stroke", INDICATORS_COLOR);
        arrowPath.setAttribute("stroke-width", "2");
        arrowPath.setAttribute(
            "d",
            [
                `M ${bounds.x + (bounds.width / 2 - 1)} ${bounds.y + (vLine < 0 ? -8 : bounds.height + 8)}`,
                `v ${vLine - 8}`,
                `a 8 8 0 0 ${hLine < 0 || vLine < 0 ? 1 : 0} ${hLine < 0 ? -8 : 8} ${vLine < 0 ? -8 : 8}`,
                `h ${hLine - (hLine < 0 ? -8 : 8)}`
            ].join(" ")
        );
        svg.appendChild(arrowPath);

        /* ========================================================================================================== */

        const startX = bounds.x + bounds.width / 2 + (hLine < 0 ? hLine - 2 : 32);
        const startY = bounds.y + (vLine < 0 ? -(bounds.height - vLine - 7) : bounds.height + vLine + 7);
        const width = hLine < 0 ? -hLine : hLine - 32;
        /* ========================================================================================================== */

        const titleBody = document.createElement("div");
        titleBody.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
        titleBody.style.margin = "0";
        titleBody.style.padding = "0";
        titleBody.style.width = "100%";
        titleBody.style.height = "100%";
        titleBody.style.fontSize = "18px";
        titleBody.style.color = INDICATORS_COLOR;
        titleBody.style.fontWeight = "bold";
        titleBody.style.display = "flex";
        titleBody.style.justifyContent = hLine < 0 ? "flex-start" : "flex-end";
        titleBody.style.alignItems = "center";
        titleBody.textContent = title;

        const titleHeight = 24;
        const titleForeignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        titleForeignObject.setAttribute("x", `${startX}`);
        titleForeignObject.setAttribute("y", `${startY - titleHeight}`);
        titleForeignObject.setAttribute("width", `${width}`);
        titleForeignObject.setAttribute("height", `${titleHeight}`);
        titleForeignObject.appendChild(titleBody);

        svg.appendChild(titleForeignObject);

        /* ========================================================================================================== */

        if (!Strings.isNullOrEmpty(subTitle)) {
            const subTitleBody = document.createElement("div");
            subTitleBody.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
            subTitleBody.style.margin = "0";
            subTitleBody.style.padding = "0";
            subTitleBody.style.width = "100%";
            subTitleBody.style.height = "100%";
            subTitleBody.style.fontSize = "14px";
            subTitleBody.style.color = INDICATORS_COLOR;
            subTitleBody.textContent = subTitle;

            const subTitleHeight = 100;
            const subTitleForeignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
            subTitleForeignObject.setAttribute("x", `${startX}`);
            subTitleForeignObject.setAttribute("y", `${startY + 2}`);
            subTitleForeignObject.setAttribute("width", `${width}`);
            subTitleForeignObject.setAttribute("height", `${subTitleHeight}`);
            subTitleForeignObject.appendChild(subTitleBody);

            svg.appendChild(subTitleForeignObject);
        }
    };
}
