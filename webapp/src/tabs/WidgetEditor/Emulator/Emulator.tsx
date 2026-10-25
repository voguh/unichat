/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useEffect, useState } from "preact/hooks";

import * as eventService from "@tauri-apps/api/event";

import type { UniChatEvent, UniChatPlatform } from "@voguh/unichat-api/widgets/events";
import { Button } from "@voguh/unichat-ui/Button";
import { Select } from "@voguh/unichat-ui/forms/Select";
import type { SelectOption } from "@voguh/unichat-ui/Select";
import { Switch } from "@voguh/unichat-ui/Switch";
import { Tooltip } from "@voguh/unichat-ui/Tooltip";
import { commandService } from "unichat/services/commandService";

import { buildEmulatedEventData, type EmulatedEventType } from "./__utils__/buildEmulatedEventData";
import { CUSTOM_EVENT_EMIT_EVENT } from "./CustomEventEditor";
import styles from "./styles.module.css";

const opModeOptions: SelectOption[] = [
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

    async function dispatchEmulatedEvent<K extends EmulatedEventType>(
        eventType: K,
        requirePlatform?: UniChatPlatform
    ): Promise<void> {
        if (requirePlatform == null && emulationMode !== "mixed") {
            requirePlatform = emulationMode as UniChatPlatform;
        }

        const data = await buildEmulatedEventData(eventType, requirePlatform);

        if (emulatorOnly) {
            dispatchEvent({ type: eventType, data } as UniChatEvent);
        } else {
            await commandService.dispatchEmulatedEvent({ type: eventType, data } as UniChatEvent);
        }
    }

    function buildTooltipContent(): PReact.ComponentChildren {
        return (
            <ul>
                <li>
                    <strong>Global</strong>: The events emitted by this emulator will be dispatched globally and can be
                    received by other widgets as well.
                </li>
                <li>
                    <strong>Emulator Only</strong>: The events emitted by this emulator will only be dispatched to the
                    emulator itself.
                </li>
            </ul>
        );
    }

    useEffect(() => {
        commandService.closeCustomEventWindow();

        return () => {
            commandService.closeCustomEventWindow();
        };
    }, []);

    useEffect(() => {
        const unListenerPromise = eventService.listen<UniChatEvent>(CUSTOM_EVENT_EMIT_EVENT, async ({ payload }) => {
            if (emulatorOnly) {
                dispatchEvent(payload);
            } else {
                await commandService.dispatchEmulatedEvent(payload);
            }
        });

        return () => {
            unListenerPromise.then((unlisten) => unlisten());
        };
    }, [emulatorOnly, dispatchEvent]);

    return (
        <div className={styles.root}>
            <div className="header">Emulator</div>

            <div className="mode">
                <Select
                    label="Emulation Mode"
                    value={emulationMode}
                    options={opModeOptions}
                    onChange={(event) => setEmulationMode(event.currentTarget.value as UniChatPlatform | "mixed")}
                />
                <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:clear")}>
                    <i className="fas fa-eraser" />
                </Button>
            </div>

            <div className="events" data-tour="widget-editor-emulator-events-dispatcher">
                <div className="title">Emit Events</div>
                <div className="buttons">
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:message")}>
                        <i className="fas fa-comment" />
                        Message
                    </Button>
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:donate", "youtube")}>
                        <i className="fas fa-money-bill-wave" />
                        Donate
                    </Button>
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:sponsor")}>
                        <i className="fas fa-star" />
                        Sponsor
                    </Button>
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:sponsor_gift")}>
                        <i className="fas fa-gift" />
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
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:cheer")}>
                        <i className="fas fa-gem" />
                        Cheer
                    </Button>
                    <Button variant="default" onClick={() => commandService.openCustomEventWindow()}>
                        <i className="fas fa-sliders-h" />
                        Custom event
                    </Button>
                </div>
            </div>

            <div className="target" data-tour="widget-editor-emulator-target-selector">
                <Tooltip content={buildTooltipContent()}>
                    <div className="title">
                        Emulation Target
                        <i className="fas fa-info-circle" />
                    </div>
                </Tooltip>

                <div className="switch-row">
                    <div>Global</div>
                    <div>
                        <Switch
                            checked={emulatorOnly}
                            onChange={(event) => setEmulatorOnly(event.currentTarget.checked)}
                        />
                    </div>
                    <div>Emulator Only</div>
                </div>
            </div>
        </div>
    );
}
