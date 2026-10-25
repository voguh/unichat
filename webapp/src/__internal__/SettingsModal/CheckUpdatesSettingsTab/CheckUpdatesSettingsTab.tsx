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

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@voguh/unichat-ui/Tabs";
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
        <TabGroup className={styles.root}>
            <TabList>
                <Tab>Latest Stable</Tab>
                <Tab>Latest Unstable</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <ReleaseNotes release={latestStable} />
                </TabPanel>
                <TabPanel>
                    <ReleaseNotes release={latestUnstable} />
                </TabPanel>
            </TabPanels>
        </TabGroup>
    );
}
