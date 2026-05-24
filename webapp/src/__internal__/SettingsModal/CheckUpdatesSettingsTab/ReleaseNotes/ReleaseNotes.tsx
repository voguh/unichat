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

import { openUrl } from "@tauri-apps/plugin-opener";

import { Badge } from "unichat/components/Badge";
import { Button } from "unichat/components/Button";
import { Markdown } from "unichat/components/Markdown";
import { UniChatRelease } from "unichat/types";

import { ReleaseNotesWrapper } from "./styled";

interface Props {
    release: UniChatRelease | null;
}

export function ReleaseNotes({ release }: Props): PReact.ComponentChildren {
    if (release == null) {
        return <div style={{ padding: "16px" }}>No stable release available.</div>;
    }

    return (
        <ReleaseNotesWrapper>
            <div className="release-name">
                <div className="release-data">
                    {release.name}
                    <Badge variant={release.prerelease ? "warning" : "success"}>
                        {release.prerelease ? "Unstable" : "Stable"}
                    </Badge>
                </div>
                <div className="release-download">
                    <Button onClick={() => openUrl(release.url)}>View release page</Button>
                </div>
            </div>

            <Markdown className="release-notes" content={release.description} />
        </ReleaseNotesWrapper>
    );
}
