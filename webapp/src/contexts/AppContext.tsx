/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { commandService } from "unichat/services/commandService";
import { loggerService } from "unichat/services/loggerService";
import { AppMetadata } from "unichat/types";

export interface AppContextProps {
    metadata: AppMetadata;
    showWidgetPreview?: boolean;
    setShowWidgetPreview?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = React.createContext({} as AppContextProps);

interface Props {
    children?: React.ReactNode;
}

export function AppContextProvider({ children }: Props): React.ReactNode {
    const [loading, setLoading] = React.useState(true);
    const [metadata, setMetadata] = React.useState<AppMetadata>(null);
    const [showWidgetPreview, setShowWidgetPreview] = React.useState(true);
    const [error, setError] = React.useState(false);

    async function init(): Promise<void> {
        try {
            const appMetadata = await commandService.getAppInfo();
            setMetadata(appMetadata);
        } catch (error) {
            loggerService.error("An error occurred while fetching app metadata: {}", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        init();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    } else if (error) {
        return <div>Error loading app metadata, please restart the app and try again!</div>;
    }

    return (
        <AppContext.Provider value={{ metadata, setShowWidgetPreview, showWidgetPreview }}>
            {children}
        </AppContext.Provider>
    );
}
