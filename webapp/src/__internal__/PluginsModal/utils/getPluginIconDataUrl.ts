/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { UniChatPluginMetadata } from "unichat/types";
import { Strings } from "unichat/utils/Strings";

export function getPluginIconDataUrl(plugin: UniChatPluginMetadata): string {
    if (Strings.isNullOrEmpty(plugin.icon)) {
        return UNICHAT_ICON;
    } else {
        return plugin.icon;
    }
}
