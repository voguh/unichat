/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { TourBuilder } from "../Tour";
import { stageBuilder } from "./stageBuilder";

export function widgetsSelectorBuilder(
    selector: string,
    title: string,
    subTitle: string,
    vLine = 50,
    hLine = 300
): TourBuilder {
    const builder = stageBuilder(selector, title, subTitle, vLine, hLine, true);

    return async function (svg, dimensions) {
        const widgetsSelectorDropdown = document.querySelector<HTMLButtonElement>("[data-tour='widgets-selector']");
        if (widgetsSelectorDropdown.getAttribute("aria-expanded") !== "true") {
            widgetsSelectorDropdown.click();
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
        await builder(svg, dimensions);
    };
}
