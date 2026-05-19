/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { TourBuilder } from "../Tour";

export function welcomeStageBuilder(title: string, subTitle: string | string[]): TourBuilder {
    return async function (container) {
        container.innerHTML = "";
        const overlay = document.createElement("div");
        overlay.classList.add("tour-backdrop");
        container.appendChild(overlay);

        const root = document.createElement("div");
        root.classList.add("tour-dialog");
        Object.assign(root.style, {
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            visibility: "visible",
            opacity: "1",
            maxWidth: "min(80vw, 520px)"
        });
        container.appendChild(root);

        const titleElem = document.createElement("div");
        titleElem.classList.add("tour-dialog-title");
        titleElem.innerHTML = title;
        titleElem.style.fontSize = "1.5rem";
        root.appendChild(titleElem);

        const subTitleElem = document.createElement("div");
        subTitleElem.classList.add("tour-dialog-subtitle");
        if (Array.isArray(subTitle)) {
            subTitleElem.innerHTML = subTitle.join("<br/>");
        } else {
            subTitleElem.innerHTML = subTitle;
        }

        Object.assign(subTitleElem.style, {
            fontSize: "1rem",
            marginTop: "0.5rem",
            paddingTop: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
        });

        root.appendChild(subTitleElem);
    };
}
