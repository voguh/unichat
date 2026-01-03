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
    title: string;
}>;

export function ModalWrapper({ id, innerProps }: Props): React.ReactNode {
    const { actions, children, leftSection, leftSectionTitle, modalProps, title } = innerProps;

    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        let isFullScreen = false;

        if (modalProps != null) {
            isFullScreen = modalProps.fullScreen ?? false;
        } else if (wrapperRef.current) {
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
            wrapperRef.current?.classList.add("is-fullscreen");
        } else {
            wrapperRef.current?.classList.remove("is-fullscreen");
        }
    }, [id]);

    return (
        <ModalWrapperStyledContainer ref={wrapperRef} className={clsx({ "with-sidebar": !!leftSection })}>
            {leftSection && (
                <div className="modal-wrapper-sidebar">
                    <div className="modal-wrapper-sidebar-header">{leftSectionTitle}</div>
                    <div className="modal-wrapper-sidebar-content">{leftSection}</div>
                </div>
            )}
            <div className="modal-wrapper-content">
                <div className="modal-wrapper-header">
                    <div className="modal-wrapper-header--title">{title}</div>
                    <div className="modal-wrapper-header--actions">
                        {actions}
                        <Button variant="default" onClick={() => modals.close(id)}>
                            <i className="fas fa-times" />
                        </Button>
                    </div>
                </div>
                <div className="modal-wrapper-body">{children}</div>
            </div>
        </ModalWrapperStyledContainer>
    );
}
