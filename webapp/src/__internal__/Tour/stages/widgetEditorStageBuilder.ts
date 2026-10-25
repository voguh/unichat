/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { Side } from "@floating-ui/dom";

import type { TourBuilder } from "unichat/__internal__/Tour";

import { stageBuilder } from "./stageBuilder";

export function widgetEditorStageBuilder(
    selector: string,
    title: string,
    subTitle: string | null,
    placement: Side
): TourBuilder {
    const builder = stageBuilder(selector, title, subTitle, placement);

    return async (container) => {
        const btn = document.querySelector<HTMLButtonElement>("[data-tour='tab-widgetEditor-toggle']");
        if (btn != null && !btn.classList.contains("btn-success")) {
            btn.click();
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
        await builder(container);
    };
}
