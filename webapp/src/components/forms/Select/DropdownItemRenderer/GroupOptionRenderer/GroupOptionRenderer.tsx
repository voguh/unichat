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

import { Option, OptionGroupBase } from "unichat/components/forms/Select";
import { OptionRenderer } from "unichat/components/forms/Select/DropdownItemRenderer/OptionRenderer";

import { GroupOptionRendererStyledContainer } from "./styled";

interface GroupOptionProps {
    group: OptionGroupBase<Option>;
    selectedValue: Option | null;
    onClick: (value: Option) => void;
}

export function GroupOptionRenderer({ group, onClick, selectedValue }: GroupOptionProps): PReact.ComponentChildren {
    return (
        <GroupOptionRendererStyledContainer>
            <div className="group-label">{group.label}</div>
            <div className="group-items">
                {group.options.map((option, idx) => (
                    <OptionRenderer
                        key={idx}
                        onClick={onClick}
                        option={option}
                        selected={option.value === selectedValue?.value}
                    />
                ))}
            </div>
        </GroupOptionRendererStyledContainer>
    );
}
