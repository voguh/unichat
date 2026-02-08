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

import { modals } from "@mantine/modals";
import { OpenContextModal } from "node_modules/@mantine/modals/lib/context";

export interface OpenModalProps extends Omit<OpenContextModal, "modal" | "innerProps"> {
    actions?: React.ReactNode;
    children: React.ReactNode;
    leftSection?: React.ReactNode;
    leftSectionTitle?: string;
    sharedStoreInitialState?: Record<string, any>;
    title: string;
}

export class ModalService {
    openModal(opts: OpenModalProps): string {
        const { actions, children, leftSection, leftSectionTitle, sharedStoreInitialState, title, ...rest } = opts;
        if ("modal" in opts) {
            delete opts.modal;
        }

        if ("innerProps" in opts) {
            delete opts.innerProps;
        }

        return modals.openContextModal({
            ...rest,
            modal: "unichat",
            withCloseButton: false,
            centered: true,
            innerProps: {
                actions: actions,
                children: children,
                leftSection: leftSection,
                leftSectionTitle: leftSectionTitle,
                modalProps: rest,
                sharedStoreInitialState: sharedStoreInitialState,
                title: title
            }
        });
    }
}

export const modalService = new ModalService();
