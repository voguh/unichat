import React from "react";

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
                    "--border-color": colorsMap[statusEvent.status],
                    "--background-color": transparentize(0.9, colorsMap[statusEvent.status]),
                    "--font-color": colorsMap[statusEvent.status]
                } as React.CSSProperties
            }
        >
            {statusEvent.status}
            <i className="fas fa-circle" />
        </ScrapperStatusStyledContainer>
    );
}
