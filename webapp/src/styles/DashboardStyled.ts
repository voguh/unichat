/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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

export const ReleaseNotesWrapper = styled.div`
    > h2 {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-family: "Roboto Mono", monospace;
    }

    > .release-notes {
        margin: 0;
        font-size: 12px;
        font-family: "Roboto Mono", monospace;
        margin-bottom: var(--mantine-spacing-xl);

        > h3 {
            margin: 0;
            padding: 0;
        }

        > ul {
            margin: 0;
            padding: 0 0 0 20px;
        }
    }
`;
