/*!******************************************************************************
 * UniChat
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import styled from "styled-components";

export const CheckUpdatesSettingsTabStyledContainer = styled.div`
    position: relative;

    > .no-versions-available {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: "Roboto Mono", monospace;
        font-size: 14px;
        text-align: center;
        margin-top: var(--mantine-spacing-md);
    }

    > .mantine-Tabs-root {
        > .mantine-Tabs-list {
        }

        > .mantine-Tabs-panel {
            --inner-tab-item-height: calc(var(--inner-setting-tab-item-height) - 34px);
            height: var(--inner-tab-item-height);
            overflow-y: auto;
        }
    }
`;

export const ReleaseNotesWrapper = styled.div`
    --inner-release-notes-wrapper-height: calc(var(--inner-tab-item-height) - 16px);
    margin-top: 16px;
    height: var(--inner-release-notes-wrapper-height);

    > .release-name {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 24px;
        font-weight: 700;

        > div:first-child {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 8px;
            margin: 0;
            font-family: "Roboto Mono", monospace;
        }

        > div:last-child {
        }
    }

    > .mantine-Divider-root {
        margin: 16px 0;
    }

    > .release-notes {
        margin: 0;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: "Roboto Mono", monospace;
        background: var(--mantine-color-body);
        height: calc(var(--inner-release-notes-wrapper-height) - (37px + 32px + 1px));
        overflow-y: auto;

        > ul {
            margin: 0;
            padding: 0 0 0 20px;
        }
    }
`;
