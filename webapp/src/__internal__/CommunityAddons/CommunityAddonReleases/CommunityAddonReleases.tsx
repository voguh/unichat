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

import { Badge } from "@voguh/unichat-ui/Badge";
import { Button } from "@voguh/unichat-ui/Button";
import type { AddonRelease, CommunityAddon } from "unichat/types/addons";

import styles from "./styles.module.css";

interface Props {
    addon: CommunityAddon;
    releases: AddonRelease[];
    latestStable: string;
    loading: boolean;
    onInstall: (release: string) => void;
}

export function CommunityAddonReleases({
    addon,
    releases,
    latestStable,
    loading,
    onInstall
}: Props): PReact.ComponentChildren {
    function renderAction(release: AddonRelease): PReact.ComponentChildren {
        if (release.name === addon.installedVersion) {
            return <Badge variant="success">Installed</Badge>;
        } else if (!addon.compatible && release.name === addon.version) {
            return (
                <Button size="sm" disabled>
                    Requires UniChat {addon.requiresUniChat}
                </Button>
            );
        }

        return (
            <Button size="sm" disabled={loading} onClick={() => onInstall(release.name)}>
                Install
            </Button>
        );
    }

    return (
        <div className={styles.root}>
            {releases.map((release) => (
                <div key={release.id}>
                    <div>
                        <div>
                            <strong>{release.name}</strong>
                            {release.prerelease && <Badge variant="info">Prerelease</Badge>}
                            {release.name === latestStable && <Badge variant="secondary">Latest stable</Badge>}
                        </div>
                        <small>{new Date(release.publishedAt).toLocaleDateString()}</small>
                    </div>
                    {renderAction(release)}
                </div>
            ))}
        </div>
    );
}
