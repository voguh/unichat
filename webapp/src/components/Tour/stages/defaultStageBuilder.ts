/*!******************************************************************************
 * UniChat
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { TourBuilder } from "../Tour";
import { stageBuilder } from "./stageBuilder";

export function defaultStageBuilder(
    selector: string,
    title: string,
    subTitle: string,
    vLine = 50,
    hLine = 300,
    ignorePrefix = false
): TourBuilder {
    const builder = stageBuilder(selector, title, subTitle, vLine, hLine, ignorePrefix);

    return async function (svg, dimensions) {
        const dashboardButton = document.querySelector<HTMLButtonElement>("[data-tour='dashboard']");
        if (dashboardButton.getAttribute("aria-expanded") !== "true") {
            dashboardButton.click();
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
        await builder(svg, dimensions);
    };
}
