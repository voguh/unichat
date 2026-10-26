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

import { openUrl } from "@tauri-apps/plugin-opener";

import { Badge } from "@voguh/unichat-ui/Badge";
import { Button } from "@voguh/unichat-ui/Button";
import { Markdown } from "@voguh/unichat-ui/Markdown";
import { ScrollableView } from "@voguh/unichat-ui/ScrollableView";
import type { UniChatRelease } from "unichat/types";

import styles from "./styles.module.css";

interface Props {
    release: UniChatRelease | null;
}

export function ReleaseNotes({ release }: Props): PReact.ComponentChildren {
    if (release == null) {
        return (
            <div className={styles.root} data-empty="true">
                No stable release available.
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className="header">
                <div className="name">
                    {release.name}
                    <Badge variant={release.prerelease ? "warning" : "success"}>
                        {release.prerelease ? "Unstable" : "Stable"}
                    </Badge>
                </div>
                <div>
                    <Button onClick={() => openUrl(release.url)}>View release page</Button>
                </div>
            </div>

            <ScrollableView>
                <Markdown content={release.description} />
            </ScrollableView>
        </div>
    );
}
