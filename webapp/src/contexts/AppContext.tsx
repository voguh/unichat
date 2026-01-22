/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import semver from "semver";

import { commandService } from "unichat/services/commandService";
import { AppMetadata } from "unichat/types";
import { UniChatRelease } from "unichat/types/unichatApi";

export interface AppContextProps {
    metadata: AppMetadata;
    releases: UniChatRelease[];
    requiresRestart: boolean;
    setRequiresRestart: () => void;
    showWidgetPreview: boolean;
    setShowWidgetPreview: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = React.createContext({} as AppContextProps);

interface Props {
    children?: React.ReactNode;
}

export function AppContextProvider({ children }: Props): React.ReactNode {
    const [loading, setLoading] = React.useState(true);
    const [metadata, setMetadata] = React.useState<AppMetadata>(null);
    const [releases, setReleases] = React.useState<UniChatRelease[]>([]);
    const [showWidgetPreview, setShowWidgetPreview] = React.useState(true);
    const [requiresRestart, setRequiresRestart] = React.useState(false);
    const [error, setError] = React.useState(false);

    const isMounted = React.useRef(false);

    async function init(): Promise<void> {
        try {
            const appMetadata = await commandService.getAppInfo();
            setMetadata(appMetadata);

            const data = await new Promise<Record<string, any>[]>((resolve) => {
                commandService
                    .getReleases()
                    .then((releases) => resolve(releases))
                    .catch((err) => {
                        _logger.error("An error occurred while fetching releases", err);
                        resolve([]);
                    });
            });
            const releases: UniChatRelease[] = data.map((release) => ({
                id: release.id,
                name: release.name || release.tag_name,
                description: release.body,
                url: release.html_url,
                draft: release.draft,
                immutable: release.immutable,
                prerelease: release.prerelease,

                createdAt: release.created_at,
                updatedAt: release.updated_at,
                publishedAt: release.published_at
            }));

            const sortedReleases = releases.sort((a, b) => semver.rcompare(a.name, b.name));
            setReleases(sortedReleases);
        } catch (error) {
            _logger.error("An error occurred while fetching app metadata", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        if (isMounted.current) {
            return;
        }

        isMounted.current = true;
        init();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    } else if (error) {
        return <div>Error loading app metadata, please restart the app and try again!</div>;
    }

    return (
        <AppContext.Provider
            value={{
                metadata,
                releases,
                requiresRestart,
                setRequiresRestart: () => setRequiresRestart(true),
                showWidgetPreview,
                setShowWidgetPreview
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
