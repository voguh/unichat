/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import openColor from "./open-color.scss?raw";

const openColorItems = openColor.split("\n").reduce(
    (acc, row) => {
        if (row.startsWith("$oc-")) {
            const [key, value] = row.split(":");
            const trimmedKey = key.substring(1).trim();
            const trimmedValue = value.trim();
            acc[trimmedKey] = trimmedValue;
        }

        return acc;
    },
    {} as Record<string, string>
);

const theme = {
    ...openColorItems
};

export { theme };
