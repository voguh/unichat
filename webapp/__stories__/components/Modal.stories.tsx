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

import { Modal } from "unichat/components/Modal";

const ModalStories: Meta<typeof Modal> = {
    title: "Components/Modal",
    argTypes: {
        withPortal: { control: "boolean" },
        onHide: { control: false },
        show: { control: "boolean" },
        autoFocus: { control: "boolean" },

        size: { control: "select", options: ["sm", "md", "lg", "xl"] },
        fullscreen: { control: "boolean" },

        backdrop: { control: "boolean" },

        title: { control: "text" },
        actions: { control: false },
        withCloseButton: { control: "boolean" }
    },
    component: Modal
};

export default ModalStories;

export const Default: StoryObj<typeof Modal> = {
    args: {
        withPortal: false,
        onHide: () => {},
        show: true,
        autoFocus: true,

        size: "md",
        fullscreen: false,

        backdrop: true,

        title: "Default Modal",
        actions: null,
        withCloseButton: true,

        children: "Default Modal"
    }
};
