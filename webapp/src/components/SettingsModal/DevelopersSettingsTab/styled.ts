/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import styled from "styled-components";

export const DevelopersSettingsTabStyledContainer = styled.div`
    position: relative;

    > .create-webview-hidden-section {
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
    }

    > .scrapper-logging-section {
        > .mantine-ButtonGroup-group {
            width: 100%;

            > .mantine-Button-root {
                flex: 1;
            }
        }
    }
`;
