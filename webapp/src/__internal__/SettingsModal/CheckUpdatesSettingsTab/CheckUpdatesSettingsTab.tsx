/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { openUrl } from "@tauri-apps/plugin-opener";
import { marked } from "marked";
import Badge from "react-bootstrap/Badge";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import { Button } from "unichat/components/Button";
import { commandService } from "unichat/services/commandService";
import { UniChatRelease } from "unichat/types";

import { CheckUpdatesSettingsTabStyledContainer, ReleaseNotesWrapper } from "./styled";

interface Props {
    onClose: () => void;
}

export function CheckUpdatesSettingsTab(_props: Props): React.ReactNode {
    const [latestStable, setLatestStable] = React.useState<UniChatRelease | null>(null);
    const [latestUnstable, setLatestUnstable] = React.useState<UniChatRelease | null>(null);

    const isMounted = React.useRef(false);

    async function init(): Promise<void> {
        const releases = await commandService.getReleases();
        setLatestStable(releases.latestStable);
        setLatestUnstable(releases.latestUnstable);
    }

    React.useEffect(() => {
        if (isMounted.current) {
            return;
        }

        isMounted.current = true;
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
        <CheckUpdatesSettingsTabStyledContainer>
            <Tabs defaultActiveKey="stable">
                <Tab eventKey="stable" title="Latest Stable">
                    {latestStable && (
                        <ReleaseNotesWrapper>
                            <div className="release-name">
                                <div>
                                    {latestStable.name}
                                    <Badge bg="success">Latest</Badge>
                                </div>
                                <div>
                                    <Button onClick={() => openUrl(latestStable.url)}>Go to Release Page</Button>
                                </div>
                            </div>

                            <hr />

                            <div
                                className="release-notes"
                                dangerouslySetInnerHTML={{ __html: marked.parse(latestStable.description) }}
                            />
                        </ReleaseNotesWrapper>
                    )}
                </Tab>
                <Tab eventKey="pre-release" title="Latest Pre-Release">
                    {latestUnstable && (
                        <ReleaseNotesWrapper>
                            <div className="release-name">
                                <div>
                                    {latestUnstable.name}
                                    <Badge bg="warning" style={{ color: "var(--oc-dark-9)" }}>
                                        Pre-Release
                                    </Badge>
                                </div>
                                <div>
                                    <Button onClick={() => openUrl(latestUnstable.url)}>Go to Release Page</Button>
                                </div>
                            </div>
                            <hr />
                            <div
                                className="release-notes"
                                dangerouslySetInnerHTML={{ __html: marked.parse(latestUnstable.description) }}
                            />
                        </ReleaseNotesWrapper>
                    )}
                </Tab>
            </Tabs>
        </CheckUpdatesSettingsTabStyledContainer>
    );
}
