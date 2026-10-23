/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { useEffect, useState } from "preact/hooks";

import { addonsService } from "unichat/services/addonsService";
import type { WidgetMetadata } from "unichat/types/widgets";

type Transformer<T = WidgetMetadata> = (widgets: WidgetMetadata[]) => T;

const cachedWidgets: WidgetMetadata[] = [];
export function useWidgets<T = WidgetMetadata>(transformer: Transformer<T>, defaultValue: T): [T, () => Promise<void>] {
    const [transformedData, setTransformedData] = useState<T | null>(null);

    async function updateWidgets(forceFetch = false): Promise<void> {
        let widgets: WidgetMetadata[] = [];
        if (forceFetch || cachedWidgets.length === 0) {
            widgets = await addonsService.getLocalWidgets();
            cachedWidgets.splice(0, cachedWidgets.length, ...widgets);
        } else {
            widgets = structuredClone(cachedWidgets);
        }

        const transformedValue = transformer(widgets);
        setTransformedData(transformedValue);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: componentDidMount
    useEffect(() => {
        updateWidgets();
    }, []);

    return [transformedData || defaultValue, () => updateWidgets(true)];
}
