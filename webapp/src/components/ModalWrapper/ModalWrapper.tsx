/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button, ModalProps } from "@mantine/core";
import { ContextModalProps, modals } from "@mantine/modals";
import clsx from "clsx";

import { ModalWrapperStyledContainer } from "./styled";

type Props = ContextModalProps<{
    actions?: React.ReactNode;
    children: React.ReactNode;
    leftSection?: React.ReactNode;
    leftSectionTitle?: string;
    modalProps?: ModalProps & { modalId?: string };
    sharedStoreInitialState?: Record<string, any>;
    title: string;
}>;

export interface ModalContextType {
    modalProps: ModalProps & { modalId?: string };
    onClose: () => void;
    setSharedStore: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    sharedStore: Record<string, any>;
}

export const ModalContext = React.createContext({} as ModalContextType);

export function ModalWrapper({ id, innerProps }: Props): React.ReactNode {
    const { actions, children, leftSection, leftSectionTitle, modalProps, sharedStoreInitialState, title } = innerProps;

    const [sharedStore, setSharedStore] = React.useState<Record<string, any>>(sharedStoreInitialState || {});
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const safeActions = sharedStore.modalActions || actions;
    const safeModalProps = (modalProps || { modalId: id }) as ModalProps & { modalId?: string };
    const safeTitle = sharedStore.modalTitle || title;
    const safeLeftSectionTitle = sharedStore.leftSectionTitle || leftSectionTitle;

    function onClose(): void {
        modals.close(id);
    }

    React.useEffect(() => {
        if (wrapperRef.current) {
            let isFullScreen = false;

            if (safeModalProps != null) {
                isFullScreen = safeModalProps.fullScreen ?? false;
            } else {
                const modalParent = wrapperRef.current.closest(".mantine-Modal-root");

                if (modalParent) {
                    const isFullscreen = modalParent.getAttribute("data-full-screen") === "true";
                    if (isFullscreen) {
                        wrapperRef.current.classList.add("is-fullscreen");
                    } else {
                        wrapperRef.current.classList.remove("is-fullscreen");
                    }
                }
            }

            if (isFullScreen) {
                wrapperRef.current.classList.add("is-fullscreen");
            } else {
                wrapperRef.current.classList.remove("is-fullscreen");
            }
        }
    }, [id]);

    return (
        <ModalContext.Provider value={{ modalProps: safeModalProps, onClose, setSharedStore, sharedStore }}>
            <ModalWrapperStyledContainer ref={wrapperRef} className={clsx({ "with-sidebar": !!leftSection })}>
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
    );
}
