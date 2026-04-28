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

import { Button } from "unichat/components/Button";

const ButtonStories: Meta<typeof Button> = {
    title: "Components/Button",
    argTypes: {
        variant: {
            control: {
                type: "select",
                options: ["default", "primary", "secondary", "success", "warning", "danger"]
            }
        }
    },
    component: Button
};

export default ButtonStories;

export const Default: StoryObj<typeof Button> = {
    args: {
        children: "Default Button"
    }
};

export const Primary: StoryObj<typeof Button> = {
    args: {
        children: "Primary Button",
        variant: "primary"
    }
};

export const Secondary: StoryObj<typeof Button> = {
    args: {
        children: "Secondary Button",
        variant: "secondary"
    }
};

export const Success: StoryObj<typeof Button> = {
    args: {
        children: "Success Button",
        variant: "success"
    }
};

export const Warning: StoryObj<typeof Button> = {
    args: {
        children: "Warning Button",
        variant: "warning"
    }
};

export const Danger: StoryObj<typeof Button> = {
    args: {
        children: "Danger Button",
        variant: "danger"
    }
};
