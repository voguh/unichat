/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { LoadingOverlayStyledContainer } from "./styled";

type ContainerProps = React.ComponentProps<"div">;
interface Props extends ContainerProps {
    visible: boolean;
    zIndex?: string | number;
}

const _logger = LoggerFactory.getLogger("LoadingOverlay");
export const LoadingOverlay = React.forwardRef<HTMLDivElement, Props>(function LoadingOverlay(props, ref) {
    const { visible, zIndex = 400, ...rest } = props;

    if (!visible) {
        return null;
    }

    return (
        <LoadingOverlayStyledContainer {...rest} ref={ref} style={{ zIndex, ...rest.style }}>
            <i className="fas fa-spinner fa-spin" />
        </LoadingOverlayStyledContainer>
    );
});
