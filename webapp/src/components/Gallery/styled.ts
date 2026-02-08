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
