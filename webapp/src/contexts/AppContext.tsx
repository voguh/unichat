/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

import React from "react";

import { invoke } from "@tauri-apps/api/core";

import { loggerService } from "unichat/services/loggerService";
import { AppMetadata } from "unichat/types";

export interface AppContextProps {
    metadata: AppMetadata;
}

export const AppContext = React.createContext({} as AppContextProps);

interface Props {
    children?: React.ReactNode;
}

export function AppContextProvider({ children }: Props): React.ReactNode {
    const [loading, setLoading] = React.useState(true);
    const [metadata, setMetadata] = React.useState<AppMetadata>(null);
    const [error, setError] = React.useState(false);

    async function init(): Promise<void> {
        try {
            const appMetadata = await invoke<AppMetadata>("get_app_info");
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

    return <AppContext.Provider value={{ metadata }}>{children}</AppContext.Provider>;
}
