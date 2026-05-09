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
import { isOptionGroup } from "unichat/components/forms/Select/__utils__/isOptionGroup";

import { GroupOptionRenderer } from "./GroupOptionRenderer";
import { OptionRenderer } from "./OptionRenderer";

interface DropdownItemProps {
    item: Option | OptionGroupBase<Option>;
    selectedValue: Option | null;
    onClick: (value: Option) => void;
}

export function DropdownItemRenderer({ item, onClick, selectedValue }: DropdownItemProps): PReact.ComponentChildren {
    if (isOptionGroup(item)) {
        return <GroupOptionRenderer group={item} onClick={onClick} selectedValue={selectedValue} />;
    } else {
        return <OptionRenderer onClick={onClick} option={item} selected={item.value === selectedValue?.value} />;
    }
}
