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

import { Tooltip } from "unichat/components/Tooltip";

const TooltipStories: Meta<typeof Tooltip> = {
    title: "Components/Tooltip",
    argTypes: {
        maxWidth: { control: "number" },
        placement: { control: "select", options: ["top", "right", "bottom", "left"] },
        content: { control: "text" }
    },
    component: Tooltip
};

export default TooltipStories;

export const Default: StoryObj<typeof Tooltip> = {
    args: {
        placement: "top",
        content: "This is the content of the Tooltip."
    },
    render: (args) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Tooltip {...args} content="This is a Tooltip">
                <button>Hover me</button>
            </Tooltip>
        </div>
    )
};
