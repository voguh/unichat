/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import PReact from "preact";

import { ButtonStyledContainer, ButtonVariant } from "./styled";

interface Props extends Omit<PReact.HTMLAttributes<HTMLButtonElement>, "ref"> {
    variant?: ButtonVariant;
}

export function Button({ children, variant, ...props }: Props): PReact.ComponentChildren {
    return (
        <ButtonStyledContainer {...props} variant={variant}>
            {children}
        </ButtonStyledContainer>
    );
}
