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
import { useState } from "preact/hooks";

import { Button } from "unichat/components/Button";
import { Portal } from "unichat/components/Portal";
import { ModalContext } from "unichat/contexts/ModalContext";

import { ModalStyledBackdrop, ModalStyledContainer } from "./styled";

export interface ModalProps extends Omit<PReact.HTMLAttributes<HTMLDivElement>, "title"> {
    withPortal?: boolean;

    onHide: () => void;
    show?: boolean;
    autoFocus?: boolean;

    size?: "sm" | "md" | "lg" | "xl";
    fullscreen?: boolean;

    backdrop?: boolean;
    CustomModalBody?: PReact.ComponentType<PReact.HTMLAttributes<HTMLDivElement>>;

    title?: PReact.ComponentChildren;
    actions?: PReact.ComponentChildren;
    withCloseButton?: boolean;
}

export function Modal({
    withPortal = true,

    onHide,
    show = true,
    autoFocus = true,

    size = "md",
    fullscreen = false,

    backdrop = true,
    CustomModalBody = ({ children, ...props }) => <div {...props}>{children}</div>,

    title,
    actions,
    withCloseButton = true,

    children,
    ...rest
}: ModalProps): PReact.ComponentChildren {
    const [sharedStore, setSharedStore] = useState<Record<string, unknown>>({});

    const content = (
        <>
            {show && (
                <>
                    {backdrop && <ModalStyledBackdrop />}
                    <ModalContext.Provider value={{ onClose: onHide, sharedStore, setSharedStore }}>
                        <ModalStyledContainer
                            {...rest}
                            data-size={size}
                            data-fullscreen={fullscreen}
                            autoFocus={autoFocus}
                        >
                            <div className="modal-content">
                                {(title != null || actions != null || withCloseButton) && (
                                    <div className="modal-header">
                                        {title != null && <div className="modal-title">{title}</div>}
                                        {(actions != null || withCloseButton) && (
                                            <div className="modal-header-actions">
                                                {actions}
                                                {withCloseButton && (
                                                    <Button className="close-button" onClick={onHide}>
                                                        <i className="fas fa-times" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {children && <CustomModalBody className="modal-body">{children}</CustomModalBody>}
                            </div>
                        </ModalStyledContainer>
                    </ModalContext.Provider>
                </>
            )}
        </>
    );

    if (withPortal) {
        return <Portal>{content}</Portal>;
    } else {
        return content;
    }
}
