/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { BadgeVariant } from "unichat/components/Badge";

export function handleBadgeVariant(status: string): BadgeVariant {
    switch (status) {
        case "LOADED":
            return "warning";
        case "INVALID":
            return "danger";
        case "ACTIVE":
            return "success";
        case "ERROR":
            return "danger";
        default:
            return "secondary";
    }
}
