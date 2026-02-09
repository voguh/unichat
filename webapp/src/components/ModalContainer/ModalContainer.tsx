/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { eventEmitter } from "unichat/services/eventEmitter";
import { OpenModalOptions } from "unichat/services/modalService";

import { ModalWrapper } from "./ModalWrapper";
import { ModalContainerStyledContainer } from "./styled";

interface RichModalWrapperProps extends OpenModalOptions {
    id: string;
}

interface Props {
    size?: "sm" | "lg" | "xl";
    fullscreen?: true | string | "sm-down" | "md-down" | "lg-down" | "xl-down" | "xxl-down";
    centered?: boolean;
    backdrop?: true | false | "static";
}

const _logger = LoggerFactory.getLogger("ModalContainer");
export function ModalContainer(defaultProps: Props): React.ReactNode {
    const [openedModals, setOpenedModals] = React.useState<RichModalWrapperProps[]>([]);

    function requestClose(id: string): void {
        setOpenedModals((prev) => prev.filter((modal) => modal.id !== id));
    }

    function handleOpenModal(modalOptions: OpenModalOptions): void {
        const richModalOptions = { ...modalOptions, id: crypto.randomUUID() };
        setOpenedModals((prev) => [...prev, richModalOptions]);
    }

    React.useEffect(() => {
        eventEmitter.on("modal:open", handleOpenModal);

        return () => {
            eventEmitter.off("modal:open", handleOpenModal);
        };
    }, []);

    return (
        <ModalContainerStyledContainer>
            {openedModals.map((modalProps) => (
                <ModalWrapper
                    key={modalProps.id}
                    show
                    onHide={() => requestClose(modalProps.id)}
                    {...defaultProps}
                    {...modalProps}
                />
            ))}
        </ModalContainerStyledContainer>
    );
}
