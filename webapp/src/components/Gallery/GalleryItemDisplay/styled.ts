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

import { Card } from "@mantine/core";
import styled from "styled-components";

export const GalleryItemDisplayStyledContainer = styled(Card)`
    > .mantine-Card-section {
        > .media-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 231px;
            height: 162px;
            background-color: var(--mantine-color-gray-9);

            > img {
                max-width: 231px;
                max-height: 162px;
                object-fit: contain;
            }

            > video {
                max-width: 231px;
                max-height: 162px;
                object-fit: contain;
            }

            > audio {
                width: calc(100% - 20px);
            }
        }
    }

    > .mantine-Text-root {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;
