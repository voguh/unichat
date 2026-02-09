/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import Card from "react-bootstrap/Card";
import styled from "styled-components";

export const GalleryItemDisplayStyledContainer = styled(Card)`
    width: 226px;
    margin: 0;
    overflow: hidden;

    > .card-body {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        width: 224px;
        height: 126px;
        background-color: var(--oc-gray-9);
        overflow: hidden;

        > img {
            max-width: 224px;
            max-height: 126px;
            object-fit: contain;
        }

        > video {
            max-width: 224px;
            max-height: 126px;
            object-fit: contain;
        }

        > audio {
            width: calc(100% - 20px);
        }
    }

    > .card-footer {
        padding: 8px;

        > .btn {
            width: 100%;
        }
    }
`;
