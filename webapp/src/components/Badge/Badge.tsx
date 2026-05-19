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

import { Variants } from "unichat/types";

import { BadgeStyledContainer } from "./styled";

export type BadgeVariant = Variants;

type VanillaProps = PReact.HTMLAttributes<HTMLDivElement>;
interface Props extends VanillaProps {
    variant?: BadgeVariant;
    children: PReact.ComponentChildren;
}

export function Badge({ variant, children, ...props }: Props): PReact.ComponentChildren {
    return (
        <BadgeStyledContainer {...props} data-variant={variant ?? "secondary"}>
            {children}
        </BadgeStyledContainer>
    );
}
