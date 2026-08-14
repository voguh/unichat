/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Side } from "@floating-ui/dom";

import { TourBuilder } from "../Tour";
import { stageBuilder } from "./stageBuilder";

export function settingsModalStageBuilder(
    selector: string,
    title: string,
    subTitle: string | null,
    placement: Side,
    tab = "general"
): TourBuilder {
    const builder = stageBuilder(selector, title, subTitle, placement);

    return async function (container) {
        if (document.querySelector("[data-tour='settings-modal']") == null) {
            document.querySelector<HTMLButtonElement>("[data-tour='settings-modal-toggle']")?.click();
            await new Promise((resolve) => setTimeout(resolve, 50));
        }

        document.querySelector<HTMLButtonElement>(`[data-tour='settings-${tab}-tab']`)?.click();

        await new Promise((resolve) => setTimeout(resolve, 50));
        await builder(container);

        return () => {
            document.querySelector<HTMLButtonElement>("[data-tour='settings-modal'] .close-button")?.click();
        };
    };
}
