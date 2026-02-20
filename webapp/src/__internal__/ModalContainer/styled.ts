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

export const ModalContainerStyledContainer = styled.div`
    > .modal {
        > .modal-dialog {
            > .modal-content {
                overflow: hidden;
            }
        }
    }
`;

export const ModalWrapperStyledContainer = styled.div`
    --modal-max-height: calc(100vh - 58px);
    --modal-header-height: 45px;

    position: relative;
    max-height: var(--modal-max-height);

    &.is-fullscreen {
        --modal-max-height: calc(100vh);
    }

    &.with-sidebar {
        display: grid;
        grid-template-columns: 200px 1fr;
        grid-template-rows: var(--settings-modal-height);
        grid-template-areas: "SB CT";

        > .modal-wrapper-sidebar {
            grid-area: SB;
            background: var(--oc-dark-7);
            color: var(--oc-dark-0);
            border-right: 1px solid var(--oc-dark-4);

            > .modal-wrapper-sidebar-header {
                height: var(--modal-header-height);
                border-bottom: 1px solid var(--oc-dark-4);
                display: flex;
                justify-content: center;
                align-items: center;
                font-weight: 700;
            }

            > .modal-wrapper-sidebar-content {
                --modal-sidebar-content-max-height: calc(var(--modal-max-height) - var(--modal-header-height));
                --modal-sidebar-content-inner-max-height: var(--modal-sidebar-content-max-height);
                max-height: var(--modal-sidebar-content-max-height);
                overflow-y: auto;
            }
        }
    }

    > .modal-wrapper-content {
        grid-area: CT;
        background: var(--oc-dark-6);

        > .modal-wrapper-header {
            height: var(--modal-header-height);
            border-bottom: 1px solid var(--oc-dark-4);
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

                > button {
                    height: 28px;

                    &:last-child {
                        width: 28px;
                        padding: 0;
                    }
                }
            }
        }

        > .modal-wrapper-body {
            --modal-body-max-height: calc(var(--modal-max-height) - var(--modal-header-height));
            --modal-body-inner-max-height: calc(var(--modal-body-max-height) - 32px);
            max-height: var(--modal-body-max-height);
            overflow-y: auto;
            padding: 16px;
        }
    }
`;
