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
import { useState } from "preact/hooks";

import { TabsStyledContainer } from "./styled";

export interface Tab {
    id: string;
    title: string;
    content: PReact.ComponentChild;
}

interface Props {
    initialTab?: string;
    tabs: Tab[];
    children?: PReact.ComponentChildren;
}

export function Tabs({ initialTab, tabs }: Props): PReact.ComponentChildren {
    const [selectedTab, setSelectedTab] = useState(initialTab ?? tabs[0].id);

    function TabContent(): PReact.ComponentChildren {
        const tabToRender = tabs.find((tab) => tab.id === selectedTab);

        if (!tabToRender) {
            return null;
        }

        return tabToRender.content;
    }

    return (
        <TabsStyledContainer>
            <div className="tabs--tab-list">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className="tab-list--tab"
                        data-selected={selectedTab === tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>
            <div className="tabs--content">
                <TabContent />
            </div>
        </TabsStyledContainer>
    );
}
