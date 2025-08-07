/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { TourStage } from "../Tour";
import { stageBuilder } from "./genericStageBuilder";

export function settingsStageBuilder(
    selector: string,
    title: string,
    subTitle: string,
    vLine = 50,
    hLine = 300
): TourStage {
    return (svg, dimensions) => {
        const settingsDropDown = document.querySelector<HTMLButtonElement>("[data-tour='settings']");
        if (settingsDropDown.getAttribute("aria-expanded") !== "true") {
            settingsDropDown.click();
        }

        setTimeout(() => {
            const builder = stageBuilder(selector, title, subTitle, vLine, hLine);
            builder(svg, dimensions);
        }, 100);
    };
}
