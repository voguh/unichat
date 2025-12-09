/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Card, Text } from "@mantine/core";

import { GalleryItem } from "unichat/types";

import { GalleryItemDisplayStyledContainer } from "./styled";

export function GalleryItemDisplay(props: GalleryItem): React.ReactNode {
    function renderPreview(): React.ReactNode {
        if (props.type === "image") {
            return <img src={props.url} alt={props.title} />;
        } else if (props.type === "video") {
            return <video src={props.url} controls />;
        } else if (props.type === "audio") {
            return <audio src={props.url} controls />;
        }

        return <img src="https://placehold.co/600x400/EEE/31343C" alt={props.title} />;
    }

    return (
        <GalleryItemDisplayStyledContainer>
            <Card.Section style={{ height: 162 }}>
                <div className="media-wrapper">{renderPreview()}</div>
            </Card.Section>
            <Text fw={500} size="lg" mt="xs">
                {props.title}
            </Text>
        </GalleryItemDisplayStyledContainer>
    );
}
