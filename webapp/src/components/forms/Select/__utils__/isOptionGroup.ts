/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Option, OptionGroupBase } from "unichat/components/forms/Select";

export function isOptionGroup(option: Option | OptionGroupBase<Option>): option is OptionGroupBase<Option> {
    return "options" in option && "label" in option;
}
