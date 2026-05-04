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
import { useEffect, useRef } from "preact/hooks";

import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { ToastStyledContainer, ToastType } from "./styled";

export interface ToastProps {
    type?: ToastType;
    icon?: PReact.ComponentChildren;
    title?: string;
    children?: PReact.ComponentChildren;
    onClick?: (e: PReact.TargetedMouseEvent<HTMLDivElement>) => void;
    onClose?: () => void;
    duration?: number;
}

export function Toast({
    children,
    icon,
    title,
    type,
    onClick,
    onClose,
    duration
}: ToastProps): PReact.ComponentChildren {
    const toastRef = useRef<HTMLDivElement>(null);

    function handleClose(): void {
        if (toastRef.current != null) {
            toastRef.current.classList.add("toast--exit");

            setTimeout(() => {
                if (onClose != null) {
                    onClose();
                }
            }, 250);
        }
    }

    function handleClick(e: PReact.TargetedMouseEvent<HTMLDivElement>): void {
        let propagationStopped = false;

        const originalStopPropagation = e.stopPropagation;
        e.stopPropagation = () => {
            propagationStopped = true;
            originalStopPropagation.call(e);
        };

        if (onClick != null) {
            onClick(e);
        }

        if (!propagationStopped) {
            handleClose();
        }
    }

    function variantIcon(): PReact.ComponentChildren {
        if (icon != null) {
            return icon;
        }

        switch (type) {
            case "success":
                return <i className="fas fa-check" />;
            case "info":
                return <i className="fas fa-info" />;
            case "error":
                return <i className="fas fa-times" />;
            case "warn":
                return <i className="fas fa-exclamation" />;
            default:
                return <i className="fas fa-bell" />;
        }
    }

    useEffect(() => {
        const innerDuration = duration ?? 5000;
        const timeout = setTimeout(handleClose, innerDuration);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return (
        <ToastStyledContainer ref={captureNativeRef(HTMLDivElement, toastRef)} type={type} onClick={handleClick}>
            <div className="toast--header">
                <div className="toast--icon">{variantIcon()}</div>
                <div className="toast--title">{title}</div>
            </div>
            <div className="toast--body">{children}</div>
        </ToastStyledContainer>
    );
}
