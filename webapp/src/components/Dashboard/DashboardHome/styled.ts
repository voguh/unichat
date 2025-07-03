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

export const DashboardHomeStyledContainer = styled.div`
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-areas: "FDS PRV";
    grid-template-columns: 1fr 400px;
    grid-template-rows: 1fr;
    gap: 8px;

    > .fields {
        grid-area: FDS;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    > .preview {
        grid-area: PRV;
        overflow: hidden;
        position: relative;

        > .preview-header {
            display: flex;
            flex-direction: row;
            gap: 4px;
            padding: 8px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;

            > .preview-header-widget-selector {
                width: 100%;
            }

            > button {
                flex-shrink: 0;
                width: 36px;
                height: 36px;
                padding: 0;
            }
        }

        > .iframe-wrapper {
            width: 100%;
            height: calc(100% - (36px + 16px + 2px)); // 36px for content, 16px for padding, 2px for border
            border-bottom-left-radius: var(--mantine-radius-default);
            border-bottom-right-radius: var(--mantine-radius-default);
            overflow: hidden;

            > iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
        }
    }
`;
