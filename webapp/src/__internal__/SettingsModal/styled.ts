/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import styled from "styled-components";

export const SettingsSidebarStyledItems = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
    height: calc(var(--modal-sidebar-content-inner-max-height) - 48px);
    width: var(--modal-sidebar-width);
    padding: 8px;

    > .divider {
        position: relative;

        > div {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--oc-dark-7);
            padding: 8px 16px;
            font-weight: 600;
            font-size: 12px;
        }
    }

    > .btn {
        > span {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            line-clamp: 1;
            white-space: nowrap;
        }
    }
`;

export const SettingsSidebarStyledFooter = styled.div`
    bottom: 16px;
    height: 48px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    > span {
        font-size: 12px;
        color: var(--oc-dark-2);
    }
`;
