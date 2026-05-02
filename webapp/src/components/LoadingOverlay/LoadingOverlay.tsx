/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { LoadingOverlayStyledContainer } from "./styled";

interface Props extends PReact.HTMLAttributes<HTMLDivElement> {
    visible: boolean;
    zIndex?: string | number;
}

const _logger = LoggerFactory.getLogger("LoadingOverlay");
export function LoadingOverlay({ visible, zIndex = 400, ref, ...rest }: Props): PReact.ComponentChildren {
    function mergeStyles(): PReact.CSSProperties {
        const style: PReact.CSSProperties = { zIndex };
        if (rest.style != null) {
            Object.assign(style, rest.style);
        }

        return style;
    }

    if (!visible) {
        return null;
    }

    return (
        <LoadingOverlayStyledContainer {...rest} ref={ref} style={mergeStyles()}>
            <i className="fas fa-spinner fa-spin" />
        </LoadingOverlayStyledContainer>
    );
}
