/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { ModalProps } from "unichat/components/Modal";

import { eventEmitter } from "./eventEmitter";

export type OpenModalOptions = Omit<ModalProps, "show" | "onHide" | "withPortal">;

export class ModalService {
    public openModal(opts: OpenModalOptions): string {
        const modalId = crypto.randomUUID();
        const richOpts = { ...opts, modalId };
        eventEmitter.emit("modal:open", richOpts);

        return modalId;
    }

    public closeModal(modalId: string): void {
        eventEmitter.emit("modal:close", { modalId });
    }

    public addOnCloseListener(modalId: string, callback: () => void): () => void {
        function handler({ modalId: closedModalId }: { modalId: string }): void {
            if (closedModalId === modalId) {
                callback();
                eventEmitter.off("modal:closed", handler);
            }
        }

        eventEmitter.on("modal:closed", handler);

        return () => {
            eventEmitter.off("modal:closed", handler);
        };
    }
}

export const modalService = new ModalService();
