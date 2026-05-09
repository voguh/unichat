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

import { Option } from "unichat/components/forms/Select";

import { OptionRendererStyledContainer } from "./styled";

interface OptionProps {
    option: Option;
    selected?: boolean;
    onClick: (value: Option) => void;
}

export function OptionRenderer({ onClick, option, selected }: OptionProps): PReact.ComponentChildren {
    return (
        <OptionRendererStyledContainer data-selected={selected ? "true" : "false"} onClick={() => onClick(option)}>
            {option.label}
        </OptionRendererStyledContainer>
    );
}
