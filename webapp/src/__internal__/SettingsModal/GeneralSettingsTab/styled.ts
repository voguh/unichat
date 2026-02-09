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

export const GeneralSettingsTabStyledContainer = styled.div`
    position: relative;

    > .tour-section {
        > .btn-group {
            width: 100%;

            > .btn {
                flex: 1;
            }
        }
    }
`;

export const OpenToLANSettingWrapper = styled.div`
    > .mantine-Switch-root {
        > .mantine-Switch-body {
            display: flex;
            justify-content: flex-start;
            align-items: center;

            > .mantine-Switch-track {
                > .mantine-Switch-thumb {
                    &::before {
                        display: none;
                    }
                }
            }
        }
    }

    > .mantine-Alert-root {
        margin-top: 16px;

        > .mantine-Alert-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;

            > .mantine-Alert-icon {
            }

            > .mantine-Alert-body {
                > .mantine-Alert-message {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
            }
        }
    }
`;
