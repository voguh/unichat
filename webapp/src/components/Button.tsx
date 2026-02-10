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

import BSButton, { ButtonProps as BSButtonProps } from "react-bootstrap/Button";
import type { BsPrefixProps, ReplaceProps } from "react-bootstrap/esm/helpers";

import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { UniChatColors } from "unichat/types";
import { Strings } from "unichat/utils/Strings";

type RichBSButtonProps = React.PropsWithChildren<ReplaceProps<"button", BsPrefixProps<"button"> & BSButtonProps>>;
export interface ButtonProps extends RichBSButtonProps {
    color?: UniChatColors;
    variant?: "filled" | "light" | "default" | "outline";

    /** @deprecated Compatibility only prefer {@link variant} and {@link color} instead! */
    bsVariant?: BSButtonProps["variant"];
}

function formatVariant(variant?: ButtonProps["variant"], color?: ButtonProps["color"]): BSButtonProps["variant"] {
    const safeVariant = Strings.isNullOrEmpty(variant) ? "filled" : variant;
    const safeColor = Strings.isNullOrEmpty(color) ? "blue" : color;
    if (["filled", "light", "outline"].includes(safeVariant)) {
        if (["light", "outline"].includes(safeVariant)) {
            return `${safeVariant}-${safeColor}`;
        }

        return safeColor;
    }

    return safeVariant;
}

const _logger = LoggerFactory.getLogger("components");
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
    const { bsVariant, variant = "filled", color = "blue" } = props;

    const safeVariant = bsVariant ?? formatVariant(variant, color);

    return <BSButton {...props} variant={safeVariant} ref={ref} />;
});
