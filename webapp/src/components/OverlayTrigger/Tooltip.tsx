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

import OverlayTrigger, { OverlayTriggerProps } from "react-bootstrap/OverlayTrigger";
import BSTooltip from "react-bootstrap/Tooltip";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

interface Props extends Omit<OverlayTriggerProps, "children" | "overlay"> {
    children: JSX.Element;

    content: React.ReactNode;

    hasDoneInitialMeasure?: boolean;
}

const _logger = LoggerFactory.getLogger("Tooltip");
export function Tooltip(props: Props): React.ReactNode {
    const { children, content, hasDoneInitialMeasure, ...rest } = props;

    const tooltip = <BSTooltip hasDoneInitialMeasure={hasDoneInitialMeasure}>{content}</BSTooltip>;

    return (
        <OverlayTrigger {...rest} overlay={tooltip}>
            {children}
        </OverlayTrigger>
    );
}
