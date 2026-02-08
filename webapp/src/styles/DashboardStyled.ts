/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import styled from "styled-components";

export const DashboardStyledContainer = styled.div`
    position: fixed;
    inset: 0;
    padding: 8px;

    display: grid;
    grid-template-areas: "SID CTT";
    grid-template-columns: 50px 1fr;
    grid-template-rows: 1fr;
    gap: 8px;

    > .sidebar {
        grid-area: SID;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;

        > div {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;

            > .divider {
                width: 100%;
                height: 0;
                border-bottom: 1px solid var(--mantine-color-gray-1);
                opacity: 0.25;
                margin: 8px 0;
            }
        }

        button {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 32px;
            height: 32px;
            min-width: 32px;
            min-height: 32px;
            padding: 0;
        }
    }

    > .content {
        grid-area: CTT;
    }
`;
