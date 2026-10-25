/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { type Dispatch, type StateUpdater, useState } from "preact/hooks";

import type { CommunityAddon } from "unichat/types/addons";

export enum CommunityAddonsFilter {
    ALL = "ALL",
    INSTALLED = "INSTALLED",
    UPDATES = "UPDATES"
}

export interface CommunityAddonsFilterState<T extends CommunityAddon> {
    search: string;
    setSearch: Dispatch<StateUpdater<string>>;
    filter: CommunityAddonsFilter;
    setFilter: Dispatch<StateUpdater<CommunityAddonsFilter>>;
    updatesCount: number;
    filteredAddons: T[];
}

export function useCommunityAddonsFilter<T extends CommunityAddon>(addons: T[]): CommunityAddonsFilterState<T> {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState(CommunityAddonsFilter.ALL);

    const updatesCount = addons.filter((addon) => addon.hasUpdate).length;
    const filteredAddons = addons.filter((addon) => {
        if (!addon.name.toLowerCase().includes(search.trim().toLowerCase())) {
            return false;
        } else if (filter === CommunityAddonsFilter.INSTALLED) {
            return addon.installedVersion != null;
        } else if (filter === CommunityAddonsFilter.UPDATES) {
            return addon.hasUpdate;
        }

        return true;
    });

    return { search, setSearch, filter, setFilter, updatesCount, filteredAddons };
}
