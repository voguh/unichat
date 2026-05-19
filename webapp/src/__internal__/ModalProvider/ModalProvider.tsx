/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { Modal } from "unichat/components/Modal";
import { eventEmitter, RichModalWrapperProps } from "unichat/services/eventEmitter";
import { OpenModalOptions } from "unichat/services/modalService";

import { ModalContainerStyledContainer } from "./styled";

interface Props {
    size?: "sm" | "md" | "lg" | "xl";
    fullscreen?: boolean;
}

export function ModalProvider(defaultProps: Props): PReact.ComponentChildren {
    const [openedModals, setOpenedModals] = useState<RichModalWrapperProps[]>([]);

    const modalContainerRef = useRef<HTMLDivElement>(null);

    function requestClose(id: string): void {
        setOpenedModals((prev) => prev.filter((modal) => modal.modalId !== id));
        eventEmitter.emit("modal:closed", { modalId: id });
    }

    useEffect(() => {
        function requestOpenModal(modalOptions: RichModalWrapperProps): void {
            setOpenedModals((prev) => [...prev, modalOptions]);
        }

        function requestCloseModal({ modalId }: { modalId: string }): void {
            requestClose(modalId);
        }

        eventEmitter.on("modal:open", requestOpenModal);
        eventEmitter.on("modal:close", requestCloseModal);

        return () => {
            eventEmitter.off("modal:open", requestOpenModal);
            eventEmitter.off("modal:close", requestCloseModal);
        };
    }, []);

    return (
        <ModalContainerStyledContainer className="modal-container" ref={modalContainerRef}>
            {openedModals.map(({ modalId, ...modalProps }) => (
                <Modal
                    {...defaultProps}
                    {...modalProps}
                    withPortal={false}
                    key={modalId}
                    show
                    onHide={() => requestClose(modalId)}
                />
            ))}
        </ModalContainerStyledContainer>
    );
}
