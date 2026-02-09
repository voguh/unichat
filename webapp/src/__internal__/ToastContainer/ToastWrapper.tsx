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

import ToastBody from "react-bootstrap/ToastBody";
import ToastHeader from "react-bootstrap/ToastHeader";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { ToastWrapperStyledContainer } from "./styled";

export type ToastTypes = "success" | "info" | "error" | "warn" | "default";

export interface ToastWrapperProps {
    title: React.ReactNode | null;
    message: React.ReactNode | null;
    onClose(): void;

    icon?: boolean | React.ReactNode;
    closeButton?: boolean;
    type?: ToastTypes;

    animation?: boolean;
    autohide?: boolean;
    delay?: number;
}

const faIcon: Record<ToastTypes, React.ReactNode> = {
    success: <i className="fas fa-check-circle" />,
    info: <i className="fas fa-info-circle" />,
    error: <i className="fas fa-times-circle" />,
    warn: <i className="fas fa-exclamation-circle" />,
    default: <i className="fas fa-dot-circle" />
};

const _logger = LoggerFactory.getLogger("ToastWrapper");
export function ToastWrapper(props: ToastWrapperProps): React.ReactNode {
    const {
        title,
        message,
        onClose,
        animation = true,
        autohide = true,
        closeButton = true,
        delay = 5000,
        icon = true,
        type = "default"
    } = props;

    const toastRef = React.useRef<HTMLDivElement>(null);

    function handleClose(): void {
        if (toastRef.current) {
            const target = toastRef.current;
            target.classList.add("showing");
        }

        setTimeout(onClose, 200);
    }

    return (
        <ToastWrapperStyledContainer
            $type={type}
            ref={toastRef}
            animation={animation}
            autohide={autohide}
            delay={delay}
            onClose={handleClose}
        >
            <ToastHeader closeButton={false}>
                <div className="toast-icon">{icon && (typeof icon === "boolean" ? faIcon[type] : icon)}</div>
                <div className="toast-title">{title}</div>
                {closeButton && (
                    <button className="toast-close-btn" onClick={() => handleClose()}>
                        <i className="fas fa-times" />
                    </button>
                )}
            </ToastHeader>
            <ToastBody>{message}</ToastBody>
        </ToastWrapperStyledContainer>
    );
}
