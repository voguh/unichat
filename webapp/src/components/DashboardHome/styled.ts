/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
                pointer-events: none;
            }
        }

        > .iframe-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--mantine-color-dark-6);
            border: 1px solid var(--mantine-color-dark-4);
            border-radius: var(--mantine-radius-default);
        }
    }
`;
