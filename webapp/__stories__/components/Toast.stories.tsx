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

import { Toast } from "unichat/components/Toast";

const ToastStories: Meta<typeof Toast> = {
    title: "Components/Toast",
    argTypes: {
        type: {
            control: "select",
            options: ["success", "info", "error", "warn", "default"]
        },
        icon: {
            control: "text"
        },
        title: {
            control: "text"
        },
        children: {
            control: "text"
        }
    },
    component: Toast
};

export default ToastStories;

export const Default: StoryObj<typeof Toast> = {
    args: {
        type: "default",
        title: "Default Toast",
        children: "This is a default toast message."
    }
};

export const Success: StoryObj<typeof Toast> = {
    args: {
        type: "success",
        title: "Success Toast",
        children: "This is a success toast message."
    }
};

export const Info: StoryObj<typeof Toast> = {
    args: {
        type: "info",
        title: "Info Toast",
        children: "This is an info toast message."
    }
};

export const Error: StoryObj<typeof Toast> = {
    args: {
        type: "error",
        title: "Error Toast",
        children: "This is an error toast message."
    }
};

export const Warning: StoryObj<typeof Toast> = {
    args: {
        type: "warn",
        title: "Warning Toast",
        children: "This is a warning toast message."
    }
};
