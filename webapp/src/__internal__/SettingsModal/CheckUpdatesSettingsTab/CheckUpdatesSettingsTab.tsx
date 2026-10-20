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
import { useEffect, useState } from "preact/hooks";

import { Tabs } from "@voguh/unichat-ui/components/ui/Tabs";
import { commandService } from "unichat/services/commandService";
import type { UniChatRelease } from "unichat/types";

import { ReleaseNotes } from "./ReleaseNotes";
import styles from "./styles.module.css";

interface Props {
    onClose: () => void;
}

export function CheckUpdatesSettingsTab(_props: Props): PReact.ComponentChildren {
    const [latestStable, setLatestStable] = useState<UniChatRelease | null>(null);
    const [latestUnstable, setLatestUnstable] = useState<UniChatRelease | null>(null);

    useEffect(() => {
        async function init(): Promise<void> {
            const releases = await commandService.getReleases();
            setLatestStable(releases.latestStable);
            setLatestUnstable(releases.latestUnstable);
        }

        init();
    }, []);

    if (!latestStable && !latestUnstable) {
        return <div>No version information available.</div>;
    }

    return (
        <Tabs.Root defaultValue="stable" className={styles.tabs}>
            <Tabs.List>
                <Tabs.Trigger value="stable">Latest Stable</Tabs.Trigger>
                <Tabs.Trigger value="unstable">Latest Unstable</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="stable" className={styles.tabContent}>
                <ReleaseNotes release={latestStable} />
            </Tabs.Content>
            <Tabs.Content value="unstable" className={styles.tabContent}>
                <ReleaseNotes release={latestUnstable} />
            </Tabs.Content>
        </Tabs.Root>
    );
}
