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

import { Button } from "unichat/components/Button";
import { commandService } from "unichat/services/commandService";
import { eventEmitter, EventEmitterEvents } from "unichat/services/eventEmitter";
import { Dimensions } from "unichat/types";

import { dashboardStageBuilder } from "./stages/dashboardStageBuilder";
import { notificationStageBuilder } from "./stages/notificationStageBuilder";
import { stageBuilder } from "./stages/stageBuilder";
import { widgetEditorStageBuilder } from "./stages/widgetEditorStageBuilder";
import { TourStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

export type TourBuilder = (svg: SVGSVGElement, dimensions: Dimensions) => Promise<void>;

export const BACKDROP_COLOR = "rgba(var(--oc-gray-9-rgb), 0.95)";
export const INDICATORS_COLOR = "var(--oc-green-6)";

interface TourStep {
    id: string;
    /**
     * If set, this step will only run if the step with the step id informed was
     * previously ran in another tour session.
     */
    replaces?: string;
    builder: TourBuilder;
}

const steps: TourStep[] = [
    {
        id: "73865214-715f-425b-8664-8ddfca448514",
        builder: dashboardStageBuilder("clear-chat", "Clear chat history", null, 50, 200)
    },
    {
        id: "25c20d64-e75c-4f0b-84f4-826ccf2fe7e6",
        builder: dashboardStageBuilder(
            "user-widgets-directory",
            "Open user widgets directory",
            "Open your own custom widgets directory, here you can add your own widgets.",
            50,
            300
        )
    },
    {
        id: "1e255868-930b-4e20-be2b-41b07c8cf97f",
        builder: dashboardStageBuilder("toggle-widget-preview", "Toggle widget preview", null, 50, 300)
    },
    {
        id: "94c455c6-5a1f-4131-83dd-aff3c25358ce",
        builder: dashboardStageBuilder("widgets-selector", "Widget selector", null, 50, -200)
    },
    {
        id: "fce131f8-3acb-4b27-82da-130f418b70ad",
        builder: dashboardStageBuilder("preview-reload", "Reload preview", null, 50, -200)
    },
    {
        id: "8df4d19e-ef74-4578-8cd2-895bb55eefaf",
        builder: dashboardStageBuilder("preview-open-in-browser", "Open preview in browser", null, 50, -300)
    },
    {
        id: "908b35ad-0127-49af-b37a-d3ec625f1d0e",
        builder: dashboardStageBuilder(
            "youtube-chat--url-input",
            "YouTube Chat URL",
            "Also you can paste normal video, shorts or live urls or direct video id.",
            50,
            300
        )
    },
    {
        id: "44515b23-2a9e-4c73-9c45-96a232d52fc2",
        builder: dashboardStageBuilder(
            "twitch-chat--url-input",
            "Twitch Chat URL",
            "Also you can paste normal Twitch url or direct channel name.",
            50,
            300
        )
    },
    {
        id: "1b19c7f5-eee9-4ef2-bc66-59cbebf06ad7",
        builder: dashboardStageBuilder(
            "kick-chat--url-input",
            "Kick Chat URL",
            "<strong>Note:</strong> Only messages and remove message events are supported for now.",
            50,
            500
        )
    },
    {
        id: "14fe744f-ac12-4ef5-91f3-c638e0367f3f",
        replaces: "1b19c7f5-eee9-4ef2-bc66-59cbebf06ad7",
        builder: notificationStageBuilder("Kick Integration was Moved", [
            "To improve kick integration, it was moved to a standalone plugin.",
            'You can find it in <a href="https://github.com/unichat-community/unichat-plugin-kick/releases" target="_blank" rel="noopener noreferrer">GitHub</a>.'
        ])
    },

    {
        id: "21fe0e64-d83f-460e-94f3-519ef3843929a",
        builder: dashboardStageBuilder(
            "tab-widgetEditor-toggle",
            "Widget Editor",
            "Here you can edit your created/downloaded widgets (System widgets aren't editable).",
            50,
            350
        )
    },
    {
        id: "4b135c24-eb9a-4960-8ae5-61c486342b78",
        builder: widgetEditorStageBuilder(
            "gallery-toggle",
            "Assets Gallery",
            "Open the assets gallery to view and manage your widget assets like images, sounds and more.",
            50,
            400
        )
    },
    {
        id: "e2961d69-f7c0-4c2f-a340-04339e3d75eb",
        builder: widgetEditorStageBuilder(
            "widget-editor-emulator-events-dispatcher",
            "Emulator Events Dispatcher",
            "Here you can emit events to test your widget's event handling functionality.",
            -50,
            -400
        )
    },

    {
        id: "fd2ac461-b46c-45db-8cd9-8737d7e64f40",
        builder: stageBuilder(
            "settings-modal-toggle",
            "Settings",
            "Manage application settings, check for updates and more.",
            -50,
            400
        )
    },
    {
        id: "d4ea3587-6b7d-4ae9-9717-53c7253037aa",
        builder: stageBuilder(
            "plugins-modal-toggle",
            "Plugins",
            "Here you can see all installed plugins and view more information about them.",
            -50,
            400
        )
    }
];

export function Tour(_props: Props): React.ReactNode {
    const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });

    const [stepsToRun, setStepsToRun] = React.useState<TourStep[]>([]);
    const [currentStep, setCurrentStep] = React.useState(-1);

    const svgRef = React.useRef<SVGSVGElement>(null);

    async function endTour(): Promise<void> {
        setStepsToRun([]);
        setCurrentStep(-1);
        commandService.setTourSteps(steps.map((s) => s.id));

        const dashboardButton = document.querySelector<HTMLButtonElement>("[data-tour='tab-dashboard-toggle']");
        if (dashboardButton != null && !dashboardButton.classList.contains("btn-success")) {
            dashboardButton.click();
        }
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
        if (svgRef.current != null) {
            if (currentStep > -1 && currentStep < stepsToRun.length) {
                const step = stepsToRun[currentStep];

                await step.builder(svgRef.current, dimensions);
            } else {
                svgRef.current.innerHTML = "";
            }
        }
    }

    function init(completedSteps: string[]): void {
        const stepsToRun = [];

        for (const step of steps) {
            const replaces = step.replaces;
            if (!completedSteps.includes(step.id) && (replaces == null || completedSteps.includes(replaces))) {
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

        init(completedSteps);
    }

    React.useEffect(() => {
        stepHandler();
    }, [currentStep]);

    React.useEffect(() => {
        function handleResize(): void {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        }

        commandService.getTourSteps().then(async (completedSteps) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
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
                        <Button disabled={currentStep === 0} onClick={previousStage}>
                            <i className="fas fa-chevron-left" />
                            Previous
                        </Button>

                        <Button disabled={currentStep === stepsToRun.length - 1} onClick={nextStage}>
                            Next
                            <i className="fas fa-chevron-right" />
                        </Button>
                    </>
                )}

                {stepsToRun.length > 1 && currentStep !== stepsToRun.length - 1 && (
                    <Button
                        style={{ position: "absolute", transform: "translateY(calc(-100% - 8px))" }}
                        variant="light"
                        color="red"
                        onClick={endTour}
                    >
                        <i className="fas fa-times" />
                        Skip Tour
                    </Button>
                )}

                {(stepsToRun.length === 1 || currentStep === stepsToRun.length - 1) && (
                    <Button
                        style={{ position: "absolute", transform: "translateY(calc(-100% - 8px))" }}
                        variant="light"
                        color="green"
                        onClick={endTour}
                    >
                        End Tour <i className="fas fa-check" />
                    </Button>
                )}
            </div>
        </TourStyledContainer>
    );
}
