/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

import React from "react";

import { Text } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { transparentize } from "polished";

import { IPCYouTubeStatusEvent } from "unichat/utils/IPCYoutubeEvents";

import { ScrapperStatusStyledContainer } from "./styled";

interface Props {
    statusEvent: IPCYouTubeStatusEvent;
    children?: React.ReactNode;
}

const colorsMap = {
    idle: "#f1f3f5",
    ready: "#fcc419",
    working: "#51cf66",
    error: "#ff6b6b"
};

export function ScrapperStatus({ statusEvent }: Props): React.ReactNode {
    return (
        <ScrapperStatusStyledContainer
            style={
                {
                    "--border-color": colorsMap[statusEvent.type],
                    "--background-color": transparentize(0.9, colorsMap[statusEvent.type]),
                    "--font-color": colorsMap[statusEvent.type]
                } as React.CSSProperties
            }
        >
            <Text>{statusEvent.type}</Text>
            <IconCircleFilled />
        </ScrapperStatusStyledContainer>
    );
}
