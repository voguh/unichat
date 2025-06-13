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
