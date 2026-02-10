/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
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
