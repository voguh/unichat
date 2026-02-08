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

    > .scraper-logging-section {
        > .mantine-ButtonGroup-group {
            width: 100%;

            > .mantine-Button-root {
                flex: 1;
            }
        }
    }
`;
