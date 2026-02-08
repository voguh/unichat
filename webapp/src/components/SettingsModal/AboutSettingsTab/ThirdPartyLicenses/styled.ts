/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { alpha } from "@mantine/core";
import styled from "styled-components";

export const ThirdPartyLicensesStyledContainer = styled.div`
    height: var(--modal-body-inner-max-height);
    margin: 0 -16px 0 0;
    padding: 0 16px 0 0;
    overflow-y: scroll;

    > table {
        > tbody {
            > tr {
                &:hover {
                    background-color: ${alpha("var(--mantine-color-anchor)", 0.25)};
                }

                > td {
                    > .withLink {
                        cursor: pointer;
                    }

                    > .mantine-Badge-root {
                        cursor: pointer;
                    }
                }
            }
        }
    }
`;
