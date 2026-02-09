/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { createContext } from "react";

import type { BsPrefixProps, ReplaceProps } from "react-bootstrap/esm/helpers";
import type { ModalProps } from "react-bootstrap/Modal";

type RichModalProps = React.PropsWithChildren<ReplaceProps<"div", BsPrefixProps<"div"> & ModalProps>>;
export interface ModalWrapperProps extends RichModalProps {
    modalId: string;

    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    leftSection?: React.ReactNode;
    leftSectionTitle?: string;
    sharedStoreInitialState?: Record<string, any>;
}

export interface ModalContextType {
    modalProps: ModalWrapperProps & { modalId?: string };
    onClose: () => void;
    setSharedStore: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    sharedStore: Record<string, any>;
}

export const ModalContext = createContext({} as ModalContextType);
