/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { alpha } from "@mantine/core";
import styled from "styled-components";

export const ThirdPartyLicensesStyledContainer = styled.div`
    height: 100%;
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
