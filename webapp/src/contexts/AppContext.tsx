import React from "react";

import { invoke } from "@tauri-apps/api/core";

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

    async function init(): Promise<void> {
        try {
            const appMetadata = await invoke<AppMetadata>("get_app_info");
            setMetadata(appMetadata);
        } catch (error) {
            console.error("Failed to fetch app metadata:", error);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        init();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <AppContext.Provider value={{ metadata }}>{children}</AppContext.Provider>;
}
