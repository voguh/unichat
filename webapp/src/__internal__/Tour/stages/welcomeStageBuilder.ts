/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { TourBuilder } from "unichat/__internal__/Tour";

export function welcomeStageBuilder(title: string, subTitle: string | string[]): TourBuilder {
    return async (container) => {
        container.innerHTML = "";
        const overlay = document.createElement("div");
        overlay.classList.add("tour-backdrop");
        container.appendChild(overlay);

        const root = document.createElement("div");
        root.classList.add("tour-dialog");
        root.setAttribute("data-welcome", "");
        container.appendChild(root);

        const titleElem = document.createElement("div");
        titleElem.classList.add("tour-dialog-title");
        titleElem.innerHTML = title;
        root.appendChild(titleElem);

        const subTitleElem = document.createElement("div");
        subTitleElem.classList.add("tour-dialog-subtitle");
        if (Array.isArray(subTitle)) {
            subTitleElem.innerHTML = subTitle.join("<br/>");
        } else {
            subTitleElem.innerHTML = subTitle;
        }

        root.appendChild(subTitleElem);
    };
}
