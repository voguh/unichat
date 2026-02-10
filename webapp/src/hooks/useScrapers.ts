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
import { UniChatScraper } from "unichat/types";

type Transformer<T = UniChatScraper> = (scrapers: UniChatScraper[]) => T;

const cachedScrapers: UniChatScraper[] = [];
export function useScrapers<T = UniChatScraper>(
    transformer: Transformer<T>,
    defaultValue: T
): [T, () => Promise<void>] {
    const [transformedData, setTransformedData] = useState<T | null>(null);

    async function updateScrapers(forceFetch = false): Promise<void> {
        let scrapers: UniChatScraper[] = [];
        if (forceFetch || cachedScrapers.length === 0) {
            scrapers = await commandService.getScrapers();
            cachedScrapers.splice(0, cachedScrapers.length, ...scrapers);
        } else {
            scrapers = [...cachedScrapers];
        }

        const transformedValue = transformer(scrapers);
        setTransformedData(transformedValue);
    }

    useEffect(() => {
        updateScrapers();
    }, []);

    return [transformedData || defaultValue, () => updateScrapers(true)];
}
