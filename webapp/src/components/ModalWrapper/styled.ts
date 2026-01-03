/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import styled from "styled-components";

export const ModalWrapperStyledContainer = styled.div`
    --modal-wrapper-max-height: calc(100vh - 58px);
    --modal-wrapper-header-height: 45px;

    &.is-fullscreen {
        --modal-wrapper-max-height: calc(100vh);
    }

    position: relative;
    max-height: var(--modal-wrapper-max-height);
    margin: -16px;

    &.with-sidebar {
        display: grid;
        grid-template-columns: 200px 1fr;
        grid-template-rows: var(--settings-modal-height);
        grid-template-areas: "SB CT";

        > .modal-wrapper-sidebar {
            grid-area: SB;
            background: var(--mantine-color-body);
            color: var(--mantine-color-text);
            border-right: 1px solid var(--mantine-color-dark-4);

            > .modal-wrapper-sidebar-header {
                height: var(--modal-wrapper-header-height);
                border-bottom: 1px solid var(--mantine-color-dark-4);
                display: flex;
                justify-content: center;
                align-items: center;
                font-weight: 700;
            }

            > .modal-wrapper-sidebar-content {
                max-height: calc(var(--modal-wrapper-max-height) - var(--modal-wrapper-header-height));
                overflow-y: auto;
            }
        }
    }

    > .modal-wrapper-content {
        grid-area: CT;
        background: var(--mantine-color-dark-6);

        > .modal-wrapper-header {
            height: var(--modal-wrapper-header-height);
            border-bottom: 1px solid var(--mantine-color-dark-4);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 8px 8px 16px;

            > .modal-wrapper-header--title {
                font-weight: 700;
            }

            > .modal-wrapper-header--actions {
                display: flex;
                align-items: center;
                gap: 8px;
                > .mantine-Button-root {
                    height: 28px;

                    &:last-child {
                        width: 28px;
                        padding: 0;
                    }
                }
            }
        }

        > .modal-wrapper-body {
            --modal-wrapper-body-max-height: calc(var(--modal-wrapper-max-height) - var(--modal-wrapper-header-height));
            --modal-wrapper-body-inner-max-height: calc(var(--modal-wrapper-body-max-height) - 32px);
            max-height: var(--modal-wrapper-body-max-height);
            overflow-y: auto;
            padding: 16px;
        }
    }
`;
