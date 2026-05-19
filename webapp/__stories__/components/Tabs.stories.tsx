/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Meta, StoryObj } from "@storybook/preact-vite";

import { Tabs } from "unichat/components/Tabs";

const TabsStories: Meta<typeof Tabs> = {
    title: "Components/Tabs",
    argTypes: {
        initialTab: { control: "text", description: "The ID of the initially selected tab." },
        tabs: {
            control: "object",
            description: "An array of tab objects, each containing an ID, title, and content."
        }
    },
    component: Tabs
};

export default TabsStories;

export const Default: StoryObj<typeof Tabs> = {
    args: {
        initialTab: "tab1",
        tabs: [
            { id: "tab1", title: "Tab 1", content: <div>Content for Tab 1</div> },
            { id: "tab2", title: "Tab 2", content: <div>Content for Tab 2</div> },
            { id: "tab3", title: "Tab 3", content: <div>Content for Tab 3</div> }
        ]
    },
    render: (args) => (
        <div className="bg-stone-900 p-2 rounded">
            <Tabs {...args} />
        </div>
    )
};
