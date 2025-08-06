/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { alpha, Button, DEFAULT_THEME } from "@mantine/core";
import { IconCheck, IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";

import { commandService } from "unichat/services/commandService";
import { Dimensions } from "unichat/types";

import { stageBuilder } from "./stages/genericStageBuilder";
import { settingsStageBuilder } from "./stages/settingsStageBuilder";
import { TourStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

export type TourStage = (svg: SVGSVGElement, dimensions: Dimensions) => void;

export const BACKDROP_COLOR = alpha(DEFAULT_THEME.colors.gray[9], 0.95);
export const INDICATORS_COLOR = DEFAULT_THEME.colors.green[6];

const stages = [
    stageBuilder("clear-chat", "Clear chat history", null, 50, 200),
    stageBuilder("widgets-selector", "Widget selector", null, 50, -200),
    stageBuilder("user-widgets-directory", "Open user widgets directory", null, 50, -300),
    stageBuilder("preview-reload", "Reload preview", null, 50, -200),
    stageBuilder("preview-open-in-browser", "Open preview in browser", null, 50, -300),
    stageBuilder("settings", "Settings", null, -50, 300),
    settingsStageBuilder("settings-check-for-updates", "Check for updates", null, -50, 300),
    settingsStageBuilder("settings-about", "Unichat about", null, -50, 300)
];
export function Tour(_props: Props): React.ReactNode {
    const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });
    const [currentStage, setCurrentStage] = React.useState(0);

    const svgRef = React.useRef<SVGSVGElement>(null);

    async function endTour(): Promise<void> {
        setCurrentStage(-1);
        commandService.endTour();
    }

    function previousStage(): void {
        if (currentStage > 0) {
            setCurrentStage(currentStage - 1);
        }
    }

    function nextStage(): void {
        if (currentStage < stages.length - 1) {
            setCurrentStage(currentStage + 1);
        }
    }

    React.useEffect(() => {
        if (currentStage > -1 && currentStage < stages.length) {
            const stageHandler = stages[currentStage];
            stageHandler(svgRef.current, dimensions);
        } else if (svgRef.current) {
            svgRef.current.innerHTML = "";
        }
    }, [currentStage]);

    React.useEffect(() => {
        function handleResize(): void {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        }

        commandService.requiresTour().then((firstTimeRun) => setCurrentStage(firstTimeRun ? 0 : -1));
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <TourStyledContainer style={{ visibility: currentStage === -1 ? "hidden" : "visible" }}>
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                xmlns="http://www.w3.org/2000/svg"
            />
            <div className="actions">
                {currentStage <= 0 ? (
                    <Button variant="light" color="red" leftSection={<IconX size={14} />} onClick={endTour}>
                        Skip Tour
                    </Button>
                ) : (
                    <Button leftSection={<IconChevronLeft size={14} />} onClick={previousStage}>
                        Previous
                    </Button>
                )}
                {currentStage < stages.length - 1 ? (
                    <Button rightSection={<IconChevronRight size={14} />} onClick={nextStage}>
                        Next
                    </Button>
                ) : (
                    <Button variant="light" color="green" rightSection={<IconCheck size={14} />} onClick={endTour}>
                        End Tour
                    </Button>
                )}
            </div>
        </TourStyledContainer>
    );
}
