/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

export interface AppContextProps {
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
    const [showWidgetPreview, setShowWidgetPreview] = React.useState(true);
    const [requiresRestart, setRequiresRestart] = React.useState(false);

    const isMounted = React.useRef(false);

    React.useEffect(() => {
        if (isMounted.current) {
            return;
        }

        isMounted.current = true;
    }, []);

    return (
        <AppContext.Provider
            value={{
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
