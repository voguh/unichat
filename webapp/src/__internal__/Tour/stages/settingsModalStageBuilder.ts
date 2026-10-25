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

export function settingsModalStageBuilder(
    selector: string,
    title: string,
    subTitle: string | null,
    placement: Side,
    tab = "general"
): TourBuilder {
    const builder = stageBuilder(selector, title, subTitle, placement);

    return async (container) => {
        if (document.querySelector("[data-tour='settings-modal']") == null) {
            const toggle = document.querySelector<HTMLButtonElement>("[data-tour='settings-modal-toggle']");
            if (toggle != null) {
                toggle.click();
            }

            await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const tabButton = document.querySelector<HTMLButtonElement>(`[data-tour='settings-${tab}-tab']`);
        if (tabButton != null) {
            tabButton.click();
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
        await builder(container);

        return () => {
            const closeSelector = "[data-tour='settings-modal'] [aria-label='Close']";
            const close = document.querySelector<HTMLButtonElement>(closeSelector);
            if (close != null) {
                close.click();
            }
        };
    };
}
