/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { Strings } from "unichat/utils/Strings";

import { BACKDROP_COLOR, INDICATORS_COLOR, TourBuilder } from "../Tour";

export function notificationStageBuilder(title: string, subTitle: string | string[]): TourBuilder {
    if (Array.isArray(subTitle)) {
        subTitle = subTitle.join("<br/>");
    }

    return async function (svg, dimensions) {
        svg.innerHTML = "";

        const backdrop = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        backdrop.setAttribute("fill", BACKDROP_COLOR);
        backdrop.setAttribute("width", `${dimensions.width}`);
        backdrop.setAttribute("height", `${dimensions.height}`);
        svg.appendChild(backdrop);

        /* ========================================================================================================== */

        const middleY = dimensions.height / 2;
        const hasSubTitle = !Strings.isNullOrEmpty(subTitle);

        /* ========================================================================================================== */

        const titleWidth = dimensions.width - 32;
        const titleHeight = 24;
        const titleStartX = 16;
        const titleStartY = hasSubTitle ? middleY - titleHeight - (8 + 1) : middleY - titleHeight;

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
        titleBody.style.justifyContent = "center";
        titleBody.style.alignItems = "center";
        titleBody.style.textAlign = "center";
        titleBody.innerHTML = title;

        const titleForeignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        titleForeignObject.setAttribute("x", `${titleStartX}`);
        titleForeignObject.setAttribute("y", `${titleStartY}`);
        titleForeignObject.setAttribute("width", `${titleWidth}`);
        titleForeignObject.setAttribute("height", `${titleHeight}`);
        titleForeignObject.appendChild(titleBody);

        svg.appendChild(titleForeignObject);

        /* ========================================================================================================== */

        if (hasSubTitle) {
            const dividerWidth = dimensions.width - 64;
            const dividerHeight = 2;
            const dividerStartX = 32;
            const dividerStartY = middleY - 1;
            const divider = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            divider.setAttribute("x", `${dividerStartX}`);
            divider.setAttribute("y", `${dividerStartY}`);
            divider.setAttribute("width", `${dividerWidth}`);
            divider.setAttribute("height", `${dividerHeight}`);
            divider.setAttribute("fill", INDICATORS_COLOR);
            svg.appendChild(divider);

            /* ====================================================================================================== */

            const subTitleWidth = dimensions.width - 32;
            const subTitleHeight = 100;
            const subTitleStartX = 16;
            const subTitleStartY = middleY + (8 + 1);

            const subTitleBody = document.createElement("div");
            subTitleBody.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
            subTitleBody.style.margin = "0";
            subTitleBody.style.padding = "0";
            subTitleBody.style.width = "100%";
            subTitleBody.style.height = "100%";
            subTitleBody.style.fontSize = "14px";
            subTitleBody.style.justifyContent = "center";
            subTitleBody.style.textAlign = "center";
            subTitleBody.style.color = INDICATORS_COLOR;
            subTitleBody.innerHTML = subTitle;

            const subTitleForeignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
            subTitleForeignObject.setAttribute("x", `${subTitleStartX}`);
            subTitleForeignObject.setAttribute("y", `${subTitleStartY}`);
            subTitleForeignObject.setAttribute("width", `${subTitleWidth}`);
            subTitleForeignObject.setAttribute("height", `${subTitleHeight}`);
            subTitleForeignObject.appendChild(subTitleBody);

            svg.appendChild(subTitleForeignObject);
        }
    };
}
