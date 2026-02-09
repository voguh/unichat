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
    width: 100%;
    padding: 8px;
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

export const SettingsModalStyledContainer = styled.div`
    --inner-setting-tab-item-height: var(--modal-body-inner-max-height);
    height: var(--inner-setting-tab-item-height);
`;
