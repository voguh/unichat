/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useState } from "preact/hooks";

import { UniChatEvent, UniChatPlatform } from "unichat-widgets/unichat";
import { Button } from "unichat/components/Button";
import { Option, Select } from "unichat/components/forms/Select";
import { Switch } from "unichat/components/forms/Switch";
import { Tooltip } from "unichat/components/Tooltip";
import { commandService } from "unichat/services/commandService";

import { buildEmulatedEventData } from "./__utils__/buildEmulatedEventData";
import { EmulatorStyledContainer } from "./styled";

const opModeOptions: Option[] = [
    { value: "mixed", label: "Mixed" },
    { value: "twitch", label: "Twitch Only" },
    { value: "youtube", label: "YouTube Only" }
];

interface Props {
    dispatchEvent: (event: UniChatEvent) => void;
}

export function Emulator({ dispatchEvent }: Props): PReact.ComponentChildren {
    const [emulationMode, setEmulationMode] = useState<UniChatPlatform | "mixed">("mixed");
    const [emulatorOnly, setEmulatorOnly] = useState(true);

    async function dispatchEmulatedEvent<T extends UniChatEvent>(
        eventType: T["type"],
        requirePlatform?: UniChatPlatform
    ): Promise<void> {
        if (requirePlatform == null && emulationMode !== "mixed") {
            requirePlatform = emulationMode as UniChatPlatform;
        }

        const data = await buildEmulatedEventData<T>(eventType, requirePlatform);

        if (emulatorOnly) {
            dispatchEvent({ type: eventType, data } as UniChatEvent);
        } else {
            await commandService.dispatchEmulatedEvent({ type: eventType, data } as UniChatEvent);
        }
    }

    function buildTooltipContent(): PReact.ComponentChildren {
        return (
            <>
                <ul>
                    <li>
                        <strong>Global</strong>: The events emitted by this emulator will be dispatched globally and can
                        be received by other widgets as well.
                    </li>
                    <li>
                        <strong>Emulator Only</strong>: The events emitted by this emulator will only be dispatched to
                        the emulator itself.
                    </li>
                </ul>
            </>
        );
    }

    return (
        <EmulatorStyledContainer>
            <div className="emulator--header">Emulator</div>

            <div className="emulator--operation-mode-select">
                <Select
                    label="Emulation Mode"
                    value={emulationMode}
                    options={opModeOptions}
                    onChange={(evt) => setEmulationMode(evt.currentTarget.value)}
                />
                <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:clear")}>
                    <i className="fas fa-eraser" />
                </Button>
            </div>

            <div className="emulator--events-dispatcher" data-tour="widget-editor-emulator-events-dispatcher">
                <div className="emulator--events-title">Emit Events</div>
                <div className="emulator--button_group">
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:message")}>
                        <i className="fas fa-comment" />
                        Message
                    </Button>
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:donate")}>
                        <i className="fas fa-money-bill-wave" />
                        Donate
                    </Button>
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:sponsor")}>
                        <i className="fas fa-star" />
                        Sponsor
                    </Button>
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:sponsor_gift")}>
                        <i className="fas fa-meteor" />
                        Sponsor Gift
                    </Button>
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:raid")}>
                        <i className="fas fa-user-friends" />
                        Raid
                    </Button>
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:redemption", "twitch")}>
                        <i className="fas fa-box" />
                        Redemption
                    </Button>
                </div>
            </div>

            <div className="emulator--emulation-target" data-tour="widget-editor-emulator-target-selector">
                <Tooltip content={buildTooltipContent()}>
                    <div className="emulator--target-title">
                        Emulation Target
                        <i className="fas fa-info-circle" />
                    </div>
                </Tooltip>

                <div className="emulator--emulation-target-select">
                    <div>Global</div>
                    <div>
                        <Switch checked={emulatorOnly} onChange={(evt) => setEmulatorOnly(evt.currentTarget.checked)} />
                    </div>
                    <div>Emulator Only</div>
                </div>
            </div>
        </EmulatorStyledContainer>
    );
}
