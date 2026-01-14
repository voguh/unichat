/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { TourBuilder } from "../Tour";
import { stageBuilder } from "./stageBuilder";

export function editorStageBuilder(
    selector: string,
    title: string,
    subTitle: string,
    vLine = 50,
    hLine = 300
): TourBuilder {
    const builder = stageBuilder(selector, title, subTitle, vLine, hLine);

    return async function (svg, dimensions) {
        const editorButton = document.querySelector<HTMLButtonElement>("[data-tour='widget-editor']");
        if (editorButton.getAttribute("data-variant") !== "filled") {
            editorButton.click();
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
        await builder(svg, dimensions);
    };
}
