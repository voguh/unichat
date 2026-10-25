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

import {
    Dialog,
    DialogBackdrop,
    DialogBody,
    DialogCloseButton,
    DialogHeader,
    DialogPanel,
    type DialogPanelSize,
    DialogTitle
} from "@voguh/unichat-ui/Dialog";
import { ModalContext } from "unichat/contexts/ModalContext";

export interface ModalProps extends Omit<PReact.HTMLAttributes<HTMLDivElement>, "title" | "size" | "ref"> {
    onHide: () => void;
    show?: boolean;

    size?: Exclude<DialogPanelSize, "fullscreen">;
    fullscreen?: boolean;

    backdrop?: boolean;
    bodyClassName?: string;

    title?: PReact.ComponentChildren;
    actions?: PReact.ComponentChildren;
    withCloseButton?: boolean;
}

export function Modal({
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

    let panelSize: DialogPanelSize = size;
    if (fullscreen) {
        panelSize = "fullscreen";
    }

    return (
        <ModalContext.Provider value={{ onClose: onHide, sharedStore, setSharedStore }}>
            <Dialog open={show} onClose={onHide} closeOnInteractOutside={false}>
                {backdrop && <DialogBackdrop />}
                <DialogPanel {...rest} size={panelSize}>
                    {(title != null || actions != null || withCloseButton) && (
                        <DialogHeader>
                            {title != null && <DialogTitle>{title}</DialogTitle>}
                            {actions}
                            {withCloseButton && <DialogCloseButton />}
                        </DialogHeader>
                    )}
                    {children != null && <DialogBody className={bodyClassName}>{children}</DialogBody>}
                </DialogPanel>
            </Dialog>
        </ModalContext.Provider>
    );
}
