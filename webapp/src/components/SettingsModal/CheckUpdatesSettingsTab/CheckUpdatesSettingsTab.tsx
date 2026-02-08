/*!******************************************************************************
 * UniChat
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { Badge, Button, Divider, Tabs } from "@mantine/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { marked } from "marked";
import semver from "semver";

import { ReleaseInfo } from "unichat/types";

import { CheckUpdatesSettingsTabStyledContainer, ReleaseNotesWrapper } from "./styled";

interface Props {
    onClose: () => void;
}

export function CheckUpdatesSettingsTab(_props: Props): React.ReactNode {
    const [latestStable, setLatestStable] = React.useState<ReleaseInfo>(null);
    const [latestBeta, setLatestBeta] = React.useState<ReleaseInfo>(null);

    const isMounted = React.useRef(false);

    async function init(): Promise<void> {
        const stableRelease = UNICHAT_RELEASES.find((release) => !release.prerelease);
        const betaRelease = UNICHAT_RELEASES.find((release) => release.prerelease);

        setLatestStable(stableRelease);
        if (betaRelease && semver.gt(betaRelease.name, stableRelease.name)) {
            setLatestBeta(betaRelease);
        }
    }

    React.useEffect(() => {
        if (isMounted.current) {
            return;
        }

        isMounted.current = true;
        init();
    }, []);

    if (!latestStable && !latestBeta) {
        return (
            <CheckUpdatesSettingsTabStyledContainer>
                <div className="no-versions-available">No version information available.</div>
            </CheckUpdatesSettingsTabStyledContainer>
        );
    }

    return (
        <CheckUpdatesSettingsTabStyledContainer>
            <Tabs variant="pills" defaultValue="stable">
                <Tabs.List>
                    <Tabs.Tab disabled={latestStable == null} value="stable">
                        Latest Stable
                    </Tabs.Tab>
                    <Tabs.Tab disabled={latestBeta == null} value="pre-release">
                        Latest Pre-Release
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="stable">
                    {latestStable && (
                        <ReleaseNotesWrapper>
                            <div className="release-name">
                                <div>
                                    {latestStable.name}
                                    <Badge variant="outline" size="xs" color="green">
                                        Latest
                                    </Badge>
                                </div>
                                <div>
                                    <Button size="xs" onClick={() => openUrl(latestStable.url)}>
                                        Go to Release Page
                                    </Button>
                                </div>
                            </div>
                            <Divider />
                            <div
                                className="release-notes"
                                dangerouslySetInnerHTML={{ __html: marked.parse(latestStable.description) }}
                            />
                        </ReleaseNotesWrapper>
                    )}
                </Tabs.Panel>
                <Tabs.Panel value="pre-release">
                    {latestBeta && (
                        <ReleaseNotesWrapper>
                            <div className="release-name">
                                <div>
                                    {latestBeta.name}
                                    <Badge variant="outline" size="xs" color="yellow">
                                        Pre-Release
                                    </Badge>
                                </div>
                                <div>
                                    <Button size="xs" onClick={() => openUrl(latestBeta.url)}>
                                        Go to Release Page
                                    </Button>
                                </div>
                            </div>
                            <Divider my="md" />
                            <div
                                className="release-notes"
                                dangerouslySetInnerHTML={{ __html: marked.parse(latestBeta.description) }}
                            />
                        </ReleaseNotesWrapper>
                    )}
                </Tabs.Panel>
            </Tabs>
            {/*  */}
        </CheckUpdatesSettingsTabStyledContainer>
    );
}
