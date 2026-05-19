/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { ComponentChildren } from "preact";

import { modalService } from "unichat/services/modalService";

import { TourBuilder } from "../Tour";

export function modalStageBuilder(title: string, subTitle: ComponentChildren): TourBuilder {
    return async function (container) {
        container.innerHTML = "";
        const overlay = document.createElement("div");
        overlay.classList.add("tour-backdrop");
        container.appendChild(overlay);

        const modalId = modalService.openModal({
            backdrop: false,
            withCloseButton: false,
            title: title,
            children: subTitle
        });

        return () => {
            modalService.closeModal(modalId);
        };
    };
}
