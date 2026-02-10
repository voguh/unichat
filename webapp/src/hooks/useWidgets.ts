/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { useEffect, useState } from "react";

import { commandService } from "unichat/services/commandService";
import { UniChatWidget } from "unichat/types";

type Transformer<T = UniChatWidget> = (widgets: UniChatWidget[]) => T;

const cachedWidgets: UniChatWidget[] = [];
export function useWidgets<T = UniChatWidget>(transformer: Transformer<T>, defaultValue: T): [T, () => Promise<void>] {
    const [transformedData, setTransformedData] = useState<T | null>(null);

    async function updateWidgets(forceFetch = false): Promise<void> {
        let widgets: UniChatWidget[] = [];
        if (forceFetch || cachedWidgets.length === 0) {
            widgets = await commandService.getWidgets();
            cachedWidgets.splice(0, cachedWidgets.length, ...widgets);
        } else {
            widgets = [...cachedWidgets];
        }

        const transformedValue = transformer(widgets);
        setTransformedData(transformedValue);
    }

    useEffect(() => {
        updateWidgets();
    }, []);

    return [transformedData || defaultValue, () => updateWidgets(true)];
}
