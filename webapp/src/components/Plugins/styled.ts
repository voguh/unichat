/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { SimpleGrid } from "@mantine/core";
import styled from "styled-components";

export const PluginsStyledContainer = styled.div`
    position: relative;
`;

export const PluginsGridContainer = styled(SimpleGrid).attrs({
    spacing: "xs",
    verticalSpacing: "xs"
})`
    > .plugin-item {
        cursor: pointer;
        border: 1px solid var(--mantine-color-dark-4);

        > div {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 140px;
            height: 140px;

            > img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            > .mantine-Badge-root {
                position: absolute;
                top: 8px;
                right: 8px;
            }
        }
    }
`;
