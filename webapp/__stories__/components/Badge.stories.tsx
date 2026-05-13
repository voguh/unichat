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

import { Badge } from "unichat/components/Badge";

const BadgeStories: Meta<typeof Badge> = {
    title: "Components/Badge",
    argTypes: {
        variant: {
            control: {
                type: "select",
                options: ["default", "primary", "secondary", "success", "warning", "danger"]
            }
        }
    },
    component: Badge
};

export default BadgeStories;

export const Primary: StoryObj<typeof Badge> = {
    args: {
        children: "Primary Badge",
        variant: "primary"
    }
};

export const Secondary: StoryObj<typeof Badge> = {
    args: {
        children: "Secondary Badge",
        variant: "secondary"
    }
};

export const Success: StoryObj<typeof Badge> = {
    args: {
        children: "Success Badge",
        variant: "success"
    }
};

export const Warning: StoryObj<typeof Badge> = {
    args: {
        children: "Warning Badge",
        variant: "warning"
    }
};

export const Danger: StoryObj<typeof Badge> = {
    args: {
        children: "Danger Badge",
        variant: "danger"
    }
};
