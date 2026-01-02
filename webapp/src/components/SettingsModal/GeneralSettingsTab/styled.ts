/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import styled from "styled-components";

export const GeneralSettingsTabStyledContainer = styled.div`
    position: relative;

    > .tour-section {
        > .mantine-ButtonGroup-group {
            width: 100%;

            > .mantine-Button-root {
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
