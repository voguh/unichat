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
import { clsx } from "@voguh/unichat-ui/utils/clsx";
import { ModalContext } from "unichat/contexts/ModalContext";

import styles from "./styles.module.css";

export interface ModalProps
    extends Omit<PReact.HTMLAttributes<HTMLDivElement>, "title" | "size" | "ref" | "className"> {
    className?: string;
    onHide: () => void;
    show?: boolean;

    size?: Exclude<DialogPanelSize, "fullscreen">;
    fullscreen?: boolean;

    backdrop?: boolean;

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

    title,
    actions,
    withCloseButton = true,

    children,
    className,
    ...rest
}: ModalProps): PReact.ComponentChildren {
    const [sharedStore, setSharedStore] = useState<Record<string, unknown>>({});

    return (
        <ModalContext.Provider value={{ onClose: onHide, sharedStore, setSharedStore }}>
            <Dialog open={show} onClose={onHide} closeOnInteractOutside={false}>
                {backdrop && <DialogBackdrop />}
                <DialogPanel {...rest} size={fullscreen ? "fullscreen" : size} className={clsx(styles.root, className)}>
                    {(title != null || actions != null || withCloseButton) && (
                        <DialogHeader>
                            {title != null && <DialogTitle>{title}</DialogTitle>}
                            {actions}
                            {withCloseButton && <DialogCloseButton />}
                        </DialogHeader>
                    )}
                    {children != null && <DialogBody>{children}</DialogBody>}
                </DialogPanel>
            </Dialog>
        </ModalContext.Provider>
    );
}
