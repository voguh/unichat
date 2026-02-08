/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import Toast from "react-bootstrap/Toast";
import styled from "styled-components";

import { ToastTypes } from "./ToastWrapper";

interface ToastStyledProps {
    $type: ToastTypes;
}

function decodeBGType(type: ToastTypes): string {
    switch (type) {
        case "success":
            return "success";
        case "info":
            return "info";
        case "warn":
            return "warning";
        case "error":
            return "danger";
        default:
            return "dark";
    }
}

function decodeFGText(type: ToastTypes): string {
    switch (type) {
        case "success":
            return "white";
        case "info":
            return "white";
        case "warn":
            return "black";
        case "error":
            return "white";
        default:
            return "white";
    }
}

type Props = React.ComponentProps<typeof Toast> & ToastStyledProps;

export const ToastWrapperStyledContainer: React.ComponentType<Props> = styled(Toast)`
    --bs-toast-zindex: 1090;
    --bs-toast-padding-x: 0.75rem;
    --bs-toast-padding-y: 0.5rem;
    --bs-toast-spacing: 16px;
    --bs-toast-max-width: 350px;
    --bs-toast-font-size: 0.875rem;
    --bs-toast-color: ${({ $type }) => `var(--bs-${decodeFGText($type)})`};
    --bs-toast-bg: ${({ $type }) => `var(--bs-${decodeBGType($type)})`};
    --bs-toast-border-width: var(--bs-border-width);
    --bs-toast-border-color: var(--bs-border-color-translucent);
    --bs-toast-border-radius: var(--bs-border-radius);
    --bs-toast-box-shadow: var(--bs-box-shadow);
    --bs-toast-header-color: ${({ $type }) => `var(--bs-${decodeFGText($type)})`};
    --bs-toast-header-bg: rgba(var(--bs-body-bg-rgb), 0.0625);
    --bs-toast-header-border-color: var(--bs-border-color-translucent);

    > .toast-header {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;

        > .toast-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            background: var(--bs-toast-header-color);
            border-radius: 4px;
            overflow: hidden;
            margin-right: var(--bs-toast-padding-x);

            > i {
                display: flex;
                justify-content: center;
                align-items: center;
                color: var(--bs-toast-bg);
            }
        }

        > .toast-title {
            flex: 1;
            font-weight: 600;
        }

        > .toast-close-btn {
            background: none;
            border: none;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 20px;
            height: 20px;
            color: var(--bs-toast-header-color);
            cursor: pointer;
            border-radius: 4px;
            overflow: hidden;
            margin-left: var(--bs-toast-padding-x);

            &:hover {
                background: rgba(var(--bs-dark-rgb), 0.125);
            }
        }
    }

    > .toast-body {
    }
`;
