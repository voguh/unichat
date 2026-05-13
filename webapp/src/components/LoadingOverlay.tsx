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

interface Props extends PReact.HTMLAttributes<HTMLDivElement> {
    visible: boolean;
    zIndex?: string | number;
}

export function LoadingOverlay({ visible, zIndex = 400, ...rest }: Props): PReact.ComponentChildren {
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
        <div {...rest} style={mergeStyles()}>
            <i className="fas fa-spinner fa-spin" />
        </div>
    );
}
