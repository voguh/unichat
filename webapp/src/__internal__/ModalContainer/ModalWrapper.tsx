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

import clsx from "clsx";
import Button from "react-bootstrap/Button";
import BSModal from "react-bootstrap/Modal";

import { ModalContext, ModalWrapperProps } from "unichat/contexts/ModalContext";

import { ModalWrapperStyledContainer } from "./styled";

export function ModalWrapper(props: ModalWrapperProps): React.ReactNode {
    const { actions, children, leftSection, leftSectionTitle, sharedStoreInitialState, title, modalId, ...rest } =
        props;

    const [sharedStore, setSharedStore] = React.useState<Record<string, any>>(sharedStoreInitialState || {});
    const safeActions = sharedStore.modalActions || actions;
    const safeTitle = sharedStore.modalTitle || title;
    const safeLeftSectionTitle = sharedStore.leftSectionTitle || leftSectionTitle;

    const modalRef = React.useRef<HTMLDivElement>(null);

    function onClose(): void {
        if (typeof rest.onHide === "function") {
            rest.onHide();
        }
    }

    return (
        <BSModal {...rest} data-modal-id={modalId} ref={modalRef}>
            <ModalContext.Provider value={{ modalProps: props, onClose, setSharedStore, sharedStore }}>
                <ModalWrapperStyledContainer
                    className={clsx({ "with-sidebar": !!leftSection, "is-fullscreen": rest.fullscreen })}
                >
                    {leftSection && (
                        <div className="modal-wrapper-sidebar">
                            <div className="modal-wrapper-sidebar-header">{safeLeftSectionTitle}</div>
                            <div className="modal-wrapper-sidebar-content">{leftSection}</div>
                        </div>
                    )}
                    <div className="modal-wrapper-content">
                        <div className="modal-wrapper-header">
                            <div className="modal-wrapper-header--title">{safeTitle}</div>
                            <div className="modal-wrapper-header--actions">
                                {safeActions}
                                <Button variant="default" onClick={onClose}>
                                    <i className="fas fa-times" />
                                </Button>
                            </div>
                        </div>
                        <div className="modal-wrapper-body">{children}</div>
                    </div>
                </ModalWrapperStyledContainer>
            </ModalContext.Provider>
        </BSModal>
    );
}
