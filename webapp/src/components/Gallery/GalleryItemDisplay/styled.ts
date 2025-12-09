/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
`;
