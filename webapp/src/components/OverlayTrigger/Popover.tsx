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
import BSPopover from "react-bootstrap/Popover";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

interface Props extends Omit<OverlayTriggerProps, "children" | "overlay"> {
    children: JSX.Element;

    title: React.ReactNode;
    content: React.ReactNode;

    hasDoneInitialMeasure?: boolean;
}

const _logger = LoggerFactory.getLogger("Popover");
export function Popover(props: Props): React.ReactNode {
    const { children, content, hasDoneInitialMeasure, title, ...rest } = props;

    const popover = (
        <BSPopover hasDoneInitialMeasure={hasDoneInitialMeasure}>
            <BSPopover.Header>{title}</BSPopover.Header>
            <BSPopover.Body>{content}</BSPopover.Body>
        </BSPopover>
    );

    return (
        <OverlayTrigger {...rest} overlay={popover}>
            {children}
        </OverlayTrigger>
    );
}
