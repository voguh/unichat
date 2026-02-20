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
import { UniChatPlugin } from "unichat/types";

type Transformer<T = UniChatPlugin> = (plugins: UniChatPlugin[]) => T;

const cachedPlugins: UniChatPlugin[] = [];
export function usePlugins<T = UniChatPlugin>(transformer: Transformer<T>, defaultValue: T): [T, () => Promise<void>] {
    const [transformedData, setTransformedData] = useState<T | null>(null);

    async function updatePlugins(forceFetch = false): Promise<void> {
        let plugins: UniChatPlugin[] = [];
        if (forceFetch || cachedPlugins.length === 0) {
            plugins = await commandService.getPlugins();
            cachedPlugins.splice(0, cachedPlugins.length, ...plugins);
        } else {
            plugins = [...cachedPlugins];
        }

        const transformedValue = transformer(plugins);
        setTransformedData(transformedValue);
    }

    useEffect(() => {
        updatePlugins();
    }, []);

    return [transformedData || defaultValue, () => updatePlugins(true)];
}
