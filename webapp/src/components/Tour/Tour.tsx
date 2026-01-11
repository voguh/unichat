/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { alpha, Button, DEFAULT_THEME } from "@mantine/core";

import { commandService } from "unichat/services/commandService";
import { eventEmitter, EventEmitterEvents } from "unichat/services/eventEmitter";
import { Dimensions } from "unichat/types";

import { defaultStageBuilder } from "./stages/defaultStageBuilder";
import { editorStageBuilder } from "./stages/editorStageBuilder";
import { widgetsSelectorBuilder } from "./stages/widgetsSelectorBuilder";
import { TourStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

interface TourBuilderMeta {
    /** This property returns `false` when tour step `replaces` is not empty and at least one matches */
    isFirstRun: boolean;
    /** This property returns `true` when run dispatch only was called by another step that requires it */
    runOnlyAsPartial: boolean;
}

export type TourBuilder = (svg: SVGSVGElement, dimensions: Dimensions, meta: TourBuilderMeta) => Promise<void>;

export const BACKDROP_COLOR = alpha(DEFAULT_THEME.colors.gray[9], 0.95);
export const INDICATORS_COLOR = DEFAULT_THEME.colors.green[6];

interface TourStep {
    id: string;
    replaces?: string[];
    builder: TourBuilder;
}

const steps: TourStep[] = [
    {
        id: "73865214-715f-425b-8664-8ddfca448514",
        builder: defaultStageBuilder("clear-chat", "Clear chat history", null, 50, 200)
    },
    {
        id: "25c20d64-e75c-4f0b-84f4-826ccf2fe7e6",
        builder: defaultStageBuilder(
            "user-widgets-directory",
            "Open user widgets directory",
            "Open your own custom widgets directory, here you can add your own widgets",
            50,
            300
        )
    },
    {
        id: "1e255868-930b-4e20-be2b-41b07c8cf97f",
        builder: defaultStageBuilder("toggle-widget-preview", "Toggle widget preview", null, 50, 300)
    },
    {
        id: "94c455c6-5a1f-4131-83dd-aff3c25358ce",
        builder: defaultStageBuilder("widgets-selector", "Widget selector", null, 50, -200)
    },
    {
        id: "830dee0e-c81f-4f3a-8fe4-2567f05ceebd",
        builder: widgetsSelectorBuilder(
            "div.mantine-Select-dropdown",
            "Widgets",
            "Contains all available widgets provided by default or created by you",
            50,
            -300
        )
    },
    {
        id: "fce131f8-3acb-4b27-82da-130f418b70ad",
        builder: defaultStageBuilder("preview-reload", "Reload preview", null, 50, -200)
    },
    {
        id: "8df4d19e-ef74-4578-8cd2-895bb55eefaf",
        builder: defaultStageBuilder("preview-open-in-browser", "Open preview in browser", null, 50, -300)
    },
    {
        id: "908b35ad-0127-49af-b37a-d3ec625f1d0e",
        builder: defaultStageBuilder(
            "youtube-chat--url-input",
            "YouTube Chat URL",
            "Also you can paste normal video, shorts or live urls or direct video id",
            50,
            300
        )
    },
    {
        id: "44515b23-2a9e-4c73-9c45-96a232d52fc2",
        builder: defaultStageBuilder(
            "twitch-chat--url-input",
            "Twitch Chat URL",
            "Also you can paste normal twitch url or direct channel name",
            50,
            300
        )
    },

    {
        id: "21fe0e64-d83f-460e-94f3-519ef3843929a",
        builder: defaultStageBuilder(
            "widget-editor",
            "Widget Editor",
            "Here you can edit your created/downloaded widgets (System/Plugin widgets aren't editable)",
            50,
            400
        )
    },
    {
        id: "4b135c24-eb9a-4960-8ae5-61c486342b78",
        builder: editorStageBuilder(
            "gallery-toggle",
            "Assets Gallery",
            "Open the assets gallery to view and manage your widget assets like images, sounds and more",
            50,
            400
        )
    },
    {
        id: "e2961d69-f7c0-4c2f-a340-04339e3d75eb",
        builder: editorStageBuilder(
            "widget-editor-emulator-events-dispatcher",
            "Emulator Events Dispatcher",
            "Here you can emit events to test your widget's event handling functionality",
            -50,
            -400
        )
    },

    {
        id: "fd2ac461-b46c-45db-8cd9-8737d7e64f40",
        builder: defaultStageBuilder(
            "settings-modal-toggle",
            "Settings",
            "Manage application settings, check for updates and more",
            -50,
            400
        )
    },
    {
        id: "d4ea3587-6b7d-4ae9-9717-53c7253037aa",
        builder: defaultStageBuilder(
            "plugins-modal-toggle",
            "Plugins",
            "Here you can see all installed plugins and view more information about them",
            -50,
            400
        )
    }
];

export function Tour(_props: Props): React.ReactNode {
    const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });

    const [previousStepsRan, setPreviousStepsRan] = React.useState<string[]>([]);
    const [stepsToRun, setStepsToRun] = React.useState<TourStep[]>([]);
    const [currentStep, setCurrentStep] = React.useState(-1);

    const svgRef = React.useRef<SVGSVGElement>(null);

    async function endTour(): Promise<void> {
        setStepsToRun([]);
        setCurrentStep(-1);
        commandService.setTourSteps(steps.map((s) => s.id));
    }

    function previousStage(): void {
        if (currentStep > 0) {
            setCurrentStep((old) => old - 1);
        }
    }

    function nextStage(): void {
        if (currentStep < stepsToRun.length - 1) {
            setCurrentStep((old) => old + 1);
        }
    }

    async function stepHandler(): Promise<void> {
        if (currentStep > -1 && currentStep < stepsToRun.length) {
            const step = stepsToRun[currentStep];

            const replaces = step.replaces ?? [];
            const isFirstRun = replaces.length === 0 || previousStepsRan.every((id) => !replaces.includes(id));
            await step.builder(svgRef.current, dimensions, { isFirstRun, runOnlyAsPartial: false });
        } else if (svgRef.current) {
            svgRef.current.innerHTML = "";
        }
    }

    function init(completedSteps: string[]): void {
        const stepsToRun = [];

        for (const step of steps) {
            if (!completedSteps.includes(step.id)) {
                stepsToRun.push(step);
            }
        }

        setStepsToRun(stepsToRun);
        setCurrentStep(stepsToRun.length > 0 ? 0 : -1);
    }

    async function handleTourStartCallback(event: EventEmitterEvents["tour:start"]): Promise<void> {
        let completedSteps: string[] = [];
        if (event.type === "whats-new") {
            completedSteps = await commandService.getPrevTourSteps();
        }

        setPreviousStepsRan(completedSteps);
        init(completedSteps);
    }

    React.useEffect(() => {
        stepHandler();
    }, [currentStep]);

    React.useEffect(() => {
        function handleResize(): void {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        }

        commandService.getTourSteps().then((completedSteps) => {
            setPreviousStepsRan(completedSteps);
            init(completedSteps);
        });
        window.addEventListener("resize", handleResize);

        eventEmitter.on("tour:start", handleTourStartCallback);

        return () => {
            eventEmitter.off("tour:start", handleTourStartCallback);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <TourStyledContainer style={{ visibility: currentStep === -1 ? "hidden" : "visible" }}>
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                xmlns="http://www.w3.org/2000/svg"
            />
            <div className="actions">
                {stepsToRun.length > 1 && (
                    <>
                        <Button
                            disabled={currentStep === 0}
                            leftSection={<i className="fas fa-chevron-left" />}
                            onClick={previousStage}
                        >
                            Previous
                        </Button>

                        <Button
                            disabled={currentStep === stepsToRun.length - 1}
                            rightSection={<i className="fas fa-chevron-right" />}
                            onClick={nextStage}
                        >
                            Next
                        </Button>
                    </>
                )}

                {stepsToRun.length > 1 && currentStep !== stepsToRun.length - 1 && (
                    <Button
                        style={{ position: "absolute", transform: "translateY(calc(-100% - 8px))" }}
                        variant="light"
                        color="red"
                        leftSection={<i className="fas fa-times" />}
                        onClick={endTour}
                    >
                        Skip Tour
                    </Button>
                )}

                {(stepsToRun.length === 1 || currentStep === stepsToRun.length - 1) && (
                    <Button
                        style={{ position: "absolute", transform: "translateY(calc(-100% - 8px))" }}
                        variant="light"
                        color="green"
                        rightSection={<i className="fas fa-check" />}
                        onClick={endTour}
                    >
                        End Tour
                    </Button>
                )}
            </div>
        </TourStyledContainer>
    );
}
