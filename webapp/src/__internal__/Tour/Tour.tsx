/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { openUrl } from "@tauri-apps/plugin-opener";

import { Button } from "unichat/components/Button";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { eventEmitter, EventEmitterEvents } from "unichat/services/eventEmitter";

import { dashboardStageBuilder } from "./stages/dashboardStageBuilder";
import { modalStageBuilder } from "./stages/modalStageBuilder";
import { stageBuilder } from "./stages/stageBuilder";
import { welcomeStageBuilder } from "./stages/welcomeStageBuilder";
import { widgetEditorStageBuilder } from "./stages/widgetEditorStageBuilder";
import { TourStyledContainer } from "./styled";

interface Props {
    children?: PReact.ComponentChildren;
}

export type TourBuilder = (container: HTMLDivElement) => Promise<(() => void) | void>;

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
        id: "c9ff8cfa-6dc7-4212-a0a8-cda2a8eb35c8",
        builder: welcomeStageBuilder(`Welcome to ${UNICHAT_DISPLAY_NAME}!`, [
            `This tour will guide you through the main features of ${UNICHAT_DISPLAY_NAME}`,
            "<small>You can also skip the tour and explore the application by yourself, if you want to see this message again you can start the tour anytime in the settings.</small>"
        ])
    },
    {
        id: "73865214-715f-425b-8664-8ddfca448514",
        builder: dashboardStageBuilder("clear-chat", "Clear chat history", null, "right")
    },
    {
        id: "25c20d64-e75c-4f0b-84f4-826ccf2fe7e6",
        builder: dashboardStageBuilder(
            "user-widgets-directory",
            "Open user widgets directory",
            "Open your own custom widgets directory, here you can add your own widgets.",
            "right"
        )
    },
    {
        id: "1e255868-930b-4e20-be2b-41b07c8cf97f",
        builder: dashboardStageBuilder("toggle-widget-preview", "Toggle widget preview", null, "right")
    },
    {
        id: "94c455c6-5a1f-4131-83dd-aff3c25358ce",
        builder: dashboardStageBuilder("widgets-selector", "Widget selector", null, "bottom")
    },
    {
        id: "fce131f8-3acb-4b27-82da-130f418b70ad",
        builder: dashboardStageBuilder("preview-reload", "Reload preview", null, "bottom")
    },
    {
        id: "8df4d19e-ef74-4578-8cd2-895bb55eefaf",
        builder: dashboardStageBuilder("preview-open-in-browser", "Open preview in browser", null, "bottom")
    },
    {
        id: "908b35ad-0127-49af-b37a-d3ec625f1d0e",
        builder: dashboardStageBuilder(
            "youtube-chat--url-input",
            "YouTube Chat URL",
            "You can also paste normal video, shorts or live urls or direct video id.",
            "bottom"
        )
    },
    {
        id: "44515b23-2a9e-4c73-9c45-96a232d52fc2",
        builder: dashboardStageBuilder(
            "twitch-chat--url-input",
            "Twitch Chat URL",
            "You can also paste normal Twitch url or direct channel name.",
            "top"
        )
    },
    {
        id: "14fe744f-ac12-4ef5-91f3-c638e0367f3f",
        replaces: "1b19c7f5-eee9-4ef2-bc66-59cbebf06ad7",
        builder: modalStageBuilder(
            "Kick Integration was Moved",
            <div className="text-center">
                <div>To improve kick integration, it was moved to a standalone plugin.</div>
                <div className="mt-2 flex justify-center">
                    <Button
                        variant="info"
                        onClick={() => openUrl("https://codeberg.org/unichat-community/unichat-plugin-kick/releases")}
                    >
                        View on Codeberg
                    </Button>
                </div>
            </div>
        )
    },

    {
        id: "21fe0e64-d83f-460e-94f3-519ef3843929a",
        builder: dashboardStageBuilder(
            "tab-widgetEditor-toggle",
            "Widget Editor",
            "Here you can edit your created/downloaded widgets (System widgets aren't editable).",
            "right"
        )
    },
    {
        id: "4b135c24-eb9a-4960-8ae5-61c486342b78",
        builder: widgetEditorStageBuilder(
            "gallery-toggle",
            "Assets Gallery",
            "Open the assets gallery to view and manage your widget assets like images, sounds and more.",
            "right"
        )
    },
    {
        id: "e2961d69-f7c0-4c2f-a340-04339e3d75eb",
        builder: widgetEditorStageBuilder(
            "widget-editor-emulator-events-dispatcher",
            "Emulator Events Dispatcher",
            "Here you can emit events to test your widget's event handling functionality.",
            "left"
        )
    },
    {
        id: "4ec842e4-c2cb-490b-ab35-43a7a8c85140",
        builder: widgetEditorStageBuilder(
            "widget-editor-emulator-target-selector",
            "Emulator Target",
            "Here you can select if emulated events should be dispatched to all widgets or only to the current widget.",
            "top"
        )
    },

    {
        id: "fd2ac461-b46c-45db-8cd9-8737d7e64f40",
        builder: stageBuilder(
            "settings-modal-toggle",
            "Settings",
            "Manage application settings, check for updates and more.",
            "top"
        )
    },
    {
        id: "d4ea3587-6b7d-4ae9-9717-53c7253037aa",
        builder: stageBuilder(
            "plugins-modal-toggle",
            "Plugins",
            "Here you can see all installed plugins and view more information about them.",
            "top"
        )
    },
    {
        id: "b567c4dc-054a-4ec8-98b8-1e886dcce93a",
        builder: stageBuilder(
            "widgets-modal-toggle",
            "Widgets",
            "Here you can see all installed widgets and open in browser or reveal in folder (user widgets only).",
            "top"
        )
    }
];

const _logger = LoggerFactory.getLogger("Tour");
export function Tour(_props: Props): PReact.ComponentChildren {
    const [stepsToRun, setStepsToRun] = useState<TourStep[]>([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [stepCleanupCallback, setStepCleanupCallback] = useState<(() => void) | null>(null);

    const svgRef = useRef<HTMLDivElement>(null);

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
            try {
                if (stepCleanupCallback != null) {
                    stepCleanupCallback();
                }
            } catch (error) {
                _logger.error("Error in beforePreviousCallback", error);
            } finally {
                setCurrentStep((old) => old - 1);
            }
        }
    }

    async function nextStage(): Promise<void> {
        if (currentStep < stepsToRun.length - 1) {
            try {
                if (stepCleanupCallback != null) {
                    stepCleanupCallback();
                }
            } catch (error) {
                _logger.error("Error in beforeNextCallback", error);
            } finally {
                setCurrentStep((old) => old + 1);
            }
        }
    }

    async function stepHandler(): Promise<void> {
        if (svgRef.current != null) {
            if (currentStep > -1 && currentStep < stepsToRun.length) {
                const step = stepsToRun[currentStep];

                const cb = await step.builder(svgRef.current);
                if (typeof cb === "function") {
                    setStepCleanupCallback(() => cb);
                }
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

    useEffect(() => {
        stepHandler();
    }, [currentStep]);

    useEffect(() => {
        commandService.getTourSteps().then(async (completedSteps) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            init(completedSteps);
        });

        eventEmitter.on("tour:start", handleTourStartCallback);

        return () => {
            eventEmitter.off("tour:start", handleTourStartCallback);
        };
    }, []);

    return (
        <TourStyledContainer style={{ visibility: currentStep === -1 ? "hidden" : "visible" }}>
            <div className="tour-container" ref={svgRef}></div>
            <div className="tour-actions">
                <Button disabled={currentStep === 0} onClick={previousStage} className="tour-prev">
                    <i className="fas fa-chevron-left" />
                    Previous
                </Button>

                <Button disabled={currentStep === stepsToRun.length - 1} onClick={nextStage} className="tour-next">
                    Next
                    <i className="fas fa-chevron-right" />
                </Button>
            </div>

            {stepsToRun.length === 1 || currentStep === stepsToRun.length - 1 ? (
                <Button variant="success" onClick={endTour} className="tour-end">
                    <i className="fas fa-check" />
                    End Tour
                </Button>
            ) : (
                <Button onClick={endTour} className="tour-skip">
                    <i className="fas fa-times" />
                    Skip Tour
                </Button>
            )}
        </TourStyledContainer>
    );
}
