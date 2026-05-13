/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useState } from "preact/hooks";

import { Tab, Tabs } from "unichat/components/Tabs";
import { commandService } from "unichat/services/commandService";
import { UniChatRelease } from "unichat/types";

import { ReleaseNotes } from "./ReleaseNotes";
import { CheckUpdatesSettingsTabStyledContainer } from "./styled";

interface Props {
    onClose: () => void;
}

export function CheckUpdatesSettingsTab(_props: Props): PReact.ComponentChildren {
    const [latestStable, setLatestStable] = useState<UniChatRelease | null>(null);
    const [latestUnstable, setLatestUnstable] = useState<UniChatRelease | null>(null);

    const tabs: Tab[] = [
        {
            id: "stable",
            title: "Latest Stable",
            content: <ReleaseNotes release={latestStable} />
        },
        {
            id: "unstable",
            title: "Latest Unstable",
            content: <ReleaseNotes release={latestUnstable} />
        }
    ];

    async function init(): Promise<void> {
        const releases = await commandService.getReleases();
        setLatestStable(releases.latestStable);
        setLatestUnstable(releases.latestUnstable);
    }

    useEffect(() => {
        init();
    }, []);

    if (!latestStable && !latestUnstable) {
        return (
            <CheckUpdatesSettingsTabStyledContainer>
                <div className="no-versions-available">No version information available.</div>
            </CheckUpdatesSettingsTabStyledContainer>
        );
    }

    return (
        <>
            <Tabs initialTab="stable" tabs={tabs} />
        </>
    );
}
