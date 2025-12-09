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
    onClick?: () => void;
}

export function GalleryItemDisplay(props: Props): React.ReactNode {
    const { onClick } = props;

    function renderPreview(): React.ReactNode {
        if (props.type === "image") {
            return <img src={props.previewUrl} alt={props.title} />;
        } else if (props.type === "video") {
            return <video src={props.previewUrl} controls />;
        } else if (props.type === "audio") {
            return <audio src={props.previewUrl} controls />;
        }

        return <img src="https://placehold.co/600x400/EEE/31343C" alt={props.title} />;
    }

    return (
        <GalleryItemDisplayStyledContainer>
            <Card.Section style={{ height: 162 }}>
                <div className="media-wrapper">{renderPreview()}</div>
            </Card.Section>
            <Text fw={500} mt="xs">
                {props.title}
            </Text>

            {!!onClick && (
                <Button fullWidth mt="md" variant="light" onClick={onClick}>
                    Select
                </Button>
            )}
        </GalleryItemDisplayStyledContainer>
    );
}
