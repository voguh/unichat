/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { notifications } from "@mantine/notifications";
import semver from "semver";

import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { AppMetadata } from "unichat/types";
import { UniChatRelease } from "unichat/types/unichatApi";

export interface AppContextProps {
    metadata: AppMetadata;
    releases: UniChatRelease[];
    showWidgetPreview: boolean;
    setShowWidgetPreview: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = React.createContext({} as AppContextProps);

interface Props {
    children?: React.ReactNode;
}

const _logger = LoggerFactory.getLogger(import.meta.url);
export function AppContextProvider({ children }: Props): React.ReactNode {
    const [loading, setLoading] = React.useState(true);
    const [metadata, setMetadata] = React.useState<AppMetadata>(null);
    const [releases, setReleases] = React.useState<UniChatRelease[]>([]);
    const [showWidgetPreview, setShowWidgetPreview] = React.useState(true);
    const [error, setError] = React.useState(false);

    const isMounted = React.useRef(false);

    async function init(): Promise<void> {
        try {
            const appMetadata = await commandService.getAppInfo();
            setMetadata(appMetadata);

            const response = await fetch("https://unichat.voguh.me/api/v1/unichat-releases", { method: "GET" });
            if (!response.ok) {
                _logger.error("Failed to fetch latest release information.");
                notifications.show({
                    title: "Update Check Failed",
                    message: "Could not fetch the latest release information from GitHub.",
                    color: "red"
                });

                return;
            }

            const releases: UniChatRelease[] = await response.json();
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
        <AppContext.Provider value={{ metadata, releases, setShowWidgetPreview, showWidgetPreview }}>
            {children}
        </AppContext.Provider>
    );
}
