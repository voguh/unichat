/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useState } from "preact/hooks";

import { Dialog, type DialogSize } from "@voguh/unichat-ui/components/ui/Dialog";
import { ModalContext } from "unichat/contexts/ModalContext";

export interface ModalProps extends Omit<PReact.HTMLAttributes<HTMLDivElement>, "title" | "size"> {
    withPortal?: boolean;

    onHide: () => void;
    show?: boolean;

    size?: Exclude<DialogSize, "fullscreen">;
    fullscreen?: boolean;

    backdrop?: boolean;
    bodyClassName?: string;

    title?: PReact.ComponentChildren;
    actions?: PReact.ComponentChildren;
    withCloseButton?: boolean;
}

export function Modal({
    withPortal = true,

    onHide,
    show = true,

    size = "md",
    fullscreen = false,

    backdrop = true,
    bodyClassName,

    title,
    actions,
    withCloseButton = true,

    children,
    ...rest
}: ModalProps): PReact.ComponentChildren {
    const [sharedStore, setSharedStore] = useState<Record<string, unknown>>({});

    return (
        <Dialog.Root
            open={show}
            modal={false}
            closeOnInteractOutside={false}
            onOpenChange={({ open }) => !open && onHide()}
        >
            <ModalContext.Provider value={{ onClose: onHide, sharedStore, setSharedStore }}>
                <Dialog.Content
                    {...rest}
                    size={fullscreen ? "fullscreen" : size}
                    backdrop={backdrop}
                    portal={withPortal}
                >
                    {(title != null || actions != null || withCloseButton) && (
                        <Dialog.Header title={title} actions={actions} withCloseButton={withCloseButton} />
                    )}
                    {children && <Dialog.Body className={bodyClassName}>{children}</Dialog.Body>}
                </Dialog.Content>
            </ModalContext.Provider>
        </Dialog.Root>
    );
}
