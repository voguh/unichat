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

import { Button } from "../Button";
import { Portal } from "../Portal";
import { ModalStyledBackdrop, ModalStyledContainer } from "./styled";

interface Props extends Omit<PReact.HTMLAttributes<HTMLDivElement>, "title"> {
    onHide: () => void;
    show?: boolean;
    autoFocus?: boolean;

    size?: "sm" | "md" | "lg" | "xl";
    fullscreen?: boolean;

    backdrop?: boolean;

    title?: PReact.ComponentChildren;
    withCloseButton?: boolean;
}

export function Modal({
    onHide,
    show = true,
    autoFocus = true,

    size = "md",
    fullscreen = false,

    backdrop = true,

    title,
    withCloseButton = true,

    children,
    ...rest
}: Props): PReact.ComponentChildren {
    return (
        <Portal>
            {show && (
                <>
                    {backdrop && <ModalStyledBackdrop />}
                    <ModalStyledContainer {...rest} data-size={size} data-fullscreen={fullscreen} autoFocus={autoFocus}>
                        <div className="modal-content">
                            {(title != null || withCloseButton) && (
                                <div className="modal-header">
                                    {title != null && <div className="modal-title">{title}</div>}
                                    {withCloseButton && (
                                        <Button className="close-button" onClick={onHide}>
                                            <i className="fas fa-times" />
                                        </Button>
                                    )}
                                </div>
                            )}
                            {children && <div className="modal-body">{children}</div>}
                        </div>
                    </ModalStyledContainer>
                </>
            )}
        </Portal>
    );
}
