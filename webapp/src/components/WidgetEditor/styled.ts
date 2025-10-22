/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import styled from "styled-components";

export const WidgetEditorEmptyStyledContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;

    > .preview-header {
        grid-area: HDR;
        display: flex;
        flex-direction: row;
        gap: 4px;
        padding: 8px;
        box-shadow: none;
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

    > .mantine-Card-root:last-child {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;

export const WidgetEditorStyledContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-areas: "HDR HDR HDR" "EDT PRV EMT";
    grid-template-columns: calc(272px + 16px) 400px 1fr;
    grid-template-rows: 54px 1fr;

    > .preview-header {
        grid-area: HDR;
        display: flex;
        flex-direction: row;
        gap: 4px;
        padding: 8px;
        box-shadow: none;
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

    > .editor-area {
        grid-area: EDT;
        background-color: var(--mantine-color-dark-6);
        border-left: calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-dark-4);
        border-bottom: calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-dark-4);
        overflow: hidden;
        border-bottom-left-radius: var(--mantine-radius-default);
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        > .editor-area-header {
            display: flex;
            gap: 8px;
            height: 30px;

            > div {
                flex: 1;
                display: flex;
                align-items: center;
            }
        }

        > .editor-fields {
            grid-area: EDF;
            overflow-y: auto;
            padding: 8px 16px 8px 8px;
            margin-right: -8px;
            height: calc(100vh - (54px + 30px + 32px + 8px));

            > div {
                &:not(:first-child) {
                    margin-top: 8px;
                }

                &.divider-wrapper {
                    margin-top: 32px;
                    margin-bottom: 32px;

                    > .mantine-Divider-root {
                        margin: 0;
                        margin-bottom: 8px;
                    }

                    > .mantine-Text-root {
                        text-align: center;
                        font-weight: bolder;
                    }
                }
            }
        }
    }

    > .preview-area {
        grid-area: PRV;
        overflow: hidden;
        position: relative;

        > iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        > div {
            position: absolute;
            inset: 0;
        }
    }

    > .emulator-area {
        grid-area: EMT;
        background-color: var(--mantine-color-dark-6);
        border-right: calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-dark-4);
        border-bottom: calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-dark-4);
        overflow: hidden;
        border-bottom-right-radius: var(--mantine-radius-default);
        padding: 8px;

        > .emulator-header {
            height: 30px;
            margin-bottom: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        > .emulator-operation-mode-select {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 8px;
            gap: 8px;

            > button {
                width: 36px;
                height: 36px;
                padding: 0;
                margin-top: 23px;
            }
        }

        > .emulator-events-dispatcher {
            > .mantine-ButtonGroup-group {
                width: 100%;
            }
        }
    }
`;
