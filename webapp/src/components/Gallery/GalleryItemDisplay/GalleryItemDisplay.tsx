/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { Button, Card, Text, Tooltip } from "@mantine/core";

import { GalleryItem } from "unichat/types";

import { GalleryItemDisplayStyledContainer } from "./styled";

interface Props extends GalleryItem {
    selected?: boolean;
    onClick?: () => void;
}

export function GalleryItemDisplay(props: Props): React.ReactNode {
    const { previewUrl, title, type, onClick, selected } = props;

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
            <Card.Section style={{ height: 162 }}>
                <div className="media-wrapper">{renderPreview()}</div>
            </Card.Section>
            <Tooltip label={title} position="top" withArrow>
                <Text fw={500} mt="xs">
                    {title}
                </Text>
            </Tooltip>

            {!!onClick && (
                <Button fullWidth mt="md" variant="light" disabled={selected} onClick={onClick}>
                    Select
                </Button>
            )}
        </GalleryItemDisplayStyledContainer>
    );
}
