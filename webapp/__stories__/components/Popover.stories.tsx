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

import { Popover } from "unichat/components/Popover";

const PopoverStories: Meta<typeof Popover> = {
    title: "Components/Popover",
    argTypes: {
        trigger: { control: "select", options: ["hover", "focus"] },
        placement: { control: "select", options: ["top", "right", "bottom", "left"] },
        title: { control: "text" },
        content: { control: "text" },

        style: { control: "object" },
        headerStyle: { control: "object" },
        bodyStyle: { control: "object" }
    },
    component: Popover
};

export default PopoverStories;

export const Default: StoryObj<typeof Popover> = {
    args: {
        trigger: "hover",
        placement: "top",
        title: "Popover Title",
        content: "This is the content of the popover."
    },
    render: (args) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Popover {...args} content="This is a popover">
                <button>Hover me</button>
            </Popover>
        </div>
    )
};

export const Focus: StoryObj<typeof Popover> = {
    args: {
        trigger: "focus",
        placement: "top",
        title: "Popover Title",
        content: "This is the content of the popover."
    },
    render: (args) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Popover {...args} content="This is a popover">
                <input type="text" />
            </Popover>
        </div>
    )
};
