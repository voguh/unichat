/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { eventEmitter } from "./eventEmitter";

export interface OpenModalOptions {
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    leftSection?: React.ReactNode;
    leftSectionTitle?: string;
    sharedStoreInitialState?: Record<string, any>;

    size?: "sm" | "lg" | "xl";
    fullscreen?: true | string | "sm-down" | "md-down" | "lg-down" | "xl-down" | "xxl-down";
    centered?: boolean;
    scrollable?: boolean;
    style?: React.CSSProperties;
    backdrop?: true | false | "static";
}

export class ModalService {
    public openModal(opts: OpenModalOptions): void {
        eventEmitter.emit("modal:open", opts);
    }
}

export const modalService = new ModalService();
