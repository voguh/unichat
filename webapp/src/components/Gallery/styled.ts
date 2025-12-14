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

export const GalleryStyledContainer = styled.div`
    position: relative;

    > .upload-to-gallery {
        position: absolute;
        top: calc(36px / 2);
        right: 2px;
        transform: translateY(-50%);
        z-index: 10;
    }
`;

export const GalleryTabContainer = styled(SimpleGrid).attrs({
    spacing: "xs",
    verticalSpacing: "xs"
})`
    padding: 16px;
    border-left: 1px solid var(--mantine-color-dark-4);
    border-right: 1px solid var(--mantine-color-dark-4);
    border-bottom: 1px solid var(--mantine-color-dark-4);
    border-radius: 0 0 4px 4px;
`;
