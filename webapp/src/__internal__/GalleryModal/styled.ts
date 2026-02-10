/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { BsPrefixProps, ReplaceProps } from "react-bootstrap/esm/helpers";
import Row, { RowProps } from "react-bootstrap/Row";
import styled from "styled-components";

export const GalleryModalStyledContainer = styled.div`
    position: relative;

    > .btn {
        height: 30px;
    }

    > .upload-to-gallery {
        position: absolute;
        top: calc(36px / 2);
        right: 2px;
        transform: translateY(-50%);
        z-index: 10;
    }
`;

type Props = React.PropsWithChildren<ReplaceProps<"div", BsPrefixProps<"div"> & RowProps>>;
export const GalleryTabContainer: React.FC<Props> = styled(Row)`
    padding: 16px;
    margin: 0;
    border-left: 1px solid var(--oc-dark-4);
    border-right: 1px solid var(--oc-dark-4);
    border-bottom: 1px solid var(--oc-dark-4);
    border-radius: 0 0 4px 4px;
`;
