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

export const SettingsStyledContainer = styled.div`
    --settings-modal-height: calc(100vh - 58px);
    position: relative;
    height: var(--settings-modal-height);
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-template-rows: var(--settings-modal-height);
    grid-template-areas: "SB CT";
    margin: -16px;

    button {
        outline: none !important;
    }

    > .settings-sidebar {
        grid-area: SB;
        background: var(--mantine-color-body);
        color: var(--mantine-color-text);
        border-right: 1px solid var(--mantine-color-dark-4);

        > .settings-sidebar-header {
            height: 45px;
            border-bottom: 1px solid var(--mantine-color-dark-4);
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 700;
        }

        > .settings-sidebar-items {
            display: flex;
            flex-direction: column;
            gap: 4px;
            overflow-y: auto;
            height: calc(100% - calc(48px + 45px));
            width: 100%;
            padding: 8px;
        }

        > .settings-sidebar-footer {
            bottom: 16px;
            height: 48px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            > span {
                font-size: 12px;
                color: var(--mantine-color-dark-2);
            }
        }
    }

    > .settings-content {
        grid-area: CT;
        background: var(--mantine-color-dark-6);

        > .settings-content-header {
            height: 45px;
            border-bottom: 1px solid var(--mantine-color-dark-4);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;

            > .settings-content-header--title {
                font-weight: 700;
            }

            > .settings-content-header--actions {
                button {
                    width: 28px;
                    height: 28px;
                    padding: 0;
                }
            }
        }

        > .settings-content-body {
            height: calc(var(--settings-modal-height) - 45px);
            overflow-y: auto;
            padding: 16px;

            > div {
                --inner-setting-tab-item-height: calc(var(--settings-modal-height) - calc(45px + 32px));
                height: var(--inner-setting-tab-item-height);
            }
        }
    }
`;
