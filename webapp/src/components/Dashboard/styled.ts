/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

import styled from "styled-components";

export const DashboardStyledContainer = styled.div`
    position: fixed;
    inset: 0;
    padding: 8px;

    display: grid;
    grid-template-areas: "SID CTT" "SID CTT";
    grid-template-columns: 50px 1fr;
    grid-template-rows: 46px 1fr;
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
