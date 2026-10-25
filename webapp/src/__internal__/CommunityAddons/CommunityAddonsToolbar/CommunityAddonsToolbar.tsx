/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";

import { Input } from "@voguh/unichat-ui/Input";
import { SegmentedControl } from "@voguh/unichat-ui/SegmentedControl";
import {
    CommunityAddonsFilter,
    type CommunityAddonsFilterState
} from "unichat/__internal__/CommunityAddons/hooks/useCommunityAddonsFilter";
import type { CommunityAddon } from "unichat/types/addons";

import styles from "./styles.module.css";

interface Props<T extends CommunityAddon> {
    placeholder: string;
    state: CommunityAddonsFilterState<T>;
}

export function CommunityAddonsToolbar<T extends CommunityAddon>({
    placeholder,
    state
}: Props<T>): PReact.ComponentChildren {
    const { search, setSearch, filter, setFilter, updatesCount } = state;

    return (
        <div className={styles.root}>
            <Input
                type="search"
                placeholder={placeholder}
                aria-label={placeholder}
                startSlot={<i className="fas fa-search" />}
                value={search}
                onInput={(event) => setSearch(event.currentTarget.value)}
            />
            <SegmentedControl
                value={filter}
                onChange={(event) => setFilter(event.currentTarget.value as CommunityAddonsFilter)}
                items={[
                    { value: CommunityAddonsFilter.ALL, label: "All" },
                    { value: CommunityAddonsFilter.INSTALLED, label: "Installed" },
                    { value: CommunityAddonsFilter.UPDATES, label: `Updates (${updatesCount})` }
                ]}
            />
        </div>
    );
}
