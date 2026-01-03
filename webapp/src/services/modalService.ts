/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { modals } from "@mantine/modals";
import { OpenContextModal } from "node_modules/@mantine/modals/lib/context";

export interface OpenModalProps extends Omit<OpenContextModal, "modal" | "innerProps"> {
    title: string;
    leftSectionTitle?: string;
    leftSection?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export class ModalService {
    openModal(opts: OpenModalProps): string {
        const { title, leftSection, leftSectionTitle, actions, children, ...modalProps } = opts;
        if ("modal" in opts) {
            delete opts.modal;
        }

        if ("innerProps" in opts) {
            delete opts.innerProps;
        }

        return modals.openContextModal({
            ...modalProps,
            modal: "unichat",
            withCloseButton: false,
            centered: true,
            innerProps: { actions, children, leftSection, leftSectionTitle, modalProps, title }
        });
    }
}

export const modalService = new ModalService();
