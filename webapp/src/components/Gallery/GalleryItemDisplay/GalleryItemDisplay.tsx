/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button, Card, Text } from "@mantine/core";

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
            <Text fw={500} mt="xs">
                {title}
            </Text>

            {!!onClick && (
                <Button fullWidth mt="md" variant="light" disabled={selected} onClick={onClick}>
                    Select
                </Button>
            )}
        </GalleryItemDisplayStyledContainer>
    );
}
