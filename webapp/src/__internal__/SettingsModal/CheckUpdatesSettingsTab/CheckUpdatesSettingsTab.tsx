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

import { openUrl } from "@tauri-apps/plugin-opener";

import { Badge } from "unichat/components/Badge";
import { Button } from "unichat/components/Button";
import { Markdown } from "unichat/components/Markdown";
import { Tab, Tabs } from "unichat/components/Tabs";
import { commandService } from "unichat/services/commandService";
import { UniChatRelease } from "unichat/types";

import { CheckUpdatesSettingsTabStyledContainer, ReleaseNotesWrapper } from "./styled";

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
            content: latestStable ? (
                <ReleaseNotesWrapper key="stable">
                    <div className="release-name">
                        <div className="release-data">
                            {latestStable.name}
                            <Badge variant="success">Latest</Badge>
                        </div>
                        <div className="release-download">
                            <Button onClick={() => openUrl(latestStable.url)}>Go to Release Page</Button>
                        </div>
                    </div>

                    <hr />

                    <Markdown className="release-notes" content={latestStable.description} />
                </ReleaseNotesWrapper>
            ) : (
                <div style={{ padding: "16px" }}>No stable release available.</div>
            )
        },
        {
            id: "unstable",
            title: "Latest Unstable",
            content: latestUnstable ? (
                <ReleaseNotesWrapper>
                    <div className="release-name">
                        <div className="release-data">
                            {latestUnstable.name}
                            <Badge variant="warning" style={{ color: "var(--oc-dark-9)" }}>
                                Pre-Release
                            </Badge>
                        </div>
                        <div className="release-download">
                            <Button onClick={() => openUrl(latestUnstable.url)}>Go to Release Page</Button>
                        </div>
                    </div>

                    <hr />

                    <Markdown className="release-notes" content={latestUnstable.description} />
                </ReleaseNotesWrapper>
            ) : (
                <div style={{ padding: "16px" }}>No unstable release available.</div>
            )
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
