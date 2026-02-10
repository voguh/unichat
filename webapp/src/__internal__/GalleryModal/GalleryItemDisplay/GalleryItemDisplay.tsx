/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import CardBody from "react-bootstrap/CardBody";
import CardFooter from "react-bootstrap/CardFooter";
import CardHeader from "react-bootstrap/CardHeader";

import { Button } from "unichat/components/Button";
import { Tooltip } from "unichat/components/OverlayTrigger";
import { ModalContext } from "unichat/contexts/ModalContext";
import { GalleryItem } from "unichat/types";

import { GalleryItemDisplayStyledContainer } from "./styled";

interface Props extends GalleryItem {
    selected?: boolean;
    onSelectItem?: (url: string, context: { close: () => void }) => void;
}

export function GalleryItemDisplay(props: Props): React.ReactNode {
    const { previewUrl, title, type, url, onSelectItem, selected } = props;

    const { onClose } = React.useContext(ModalContext);

    function renderPreview(): React.ReactNode {
        if ((previewUrl ?? "").trim().length > 0) {
            if (type === "image") {
                return <img src={previewUrl} alt={title} />;
            } else if (type === "video") {
                return <video src={previewUrl} controls />;
            } else if (type === "audio") {
                return <audio src={previewUrl} controls />;
            }
        }

        return <img src="https://placehold.co/600x400?text=No+Preview" alt="No Preview Available" />;
    }

    return (
        <GalleryItemDisplayStyledContainer>
            <CardHeader>
                <Tooltip content={title} placement="top">
                    <span>{title}</span>
                </Tooltip>
            </CardHeader>
            <CardBody>{renderPreview()}</CardBody>
            {!!onSelectItem && (
                <CardFooter>
                    <Button disabled={selected} onClick={() => onSelectItem(url, { close: onClose })}>
                        Select
                    </Button>
                </CardFooter>
            )}
        </GalleryItemDisplayStyledContainer>
    );
}
