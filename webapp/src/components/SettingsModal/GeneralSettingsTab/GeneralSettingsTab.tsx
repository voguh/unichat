/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button, ComboboxData, Divider, Select, Text } from "@mantine/core";

import { commandService } from "unichat/services/commandService";
import { eventEmitter, EventEmitterEvents } from "unichat/services/eventEmitter";
import { WIDGET_URL_PREFIX } from "unichat/utils/constants";

import { GeneralSettingsTabStyledContainer } from "./styled";

interface Props {
    onClose: () => void;
}

export function GeneralSettingsTab({ onClose }: Props): React.ReactNode {
    const [widgets, setWidgets] = React.useState<ComboboxData>([]);

    function dispatchTour(type: EventEmitterEvents["tour:start"]["type"]): void {
        onClose();
        eventEmitter.emit("tour:start", { type });
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const widgets = await commandService.listWidgets();
            const sortedWidgets = widgets.map((groupItem) => ({
                group: groupItem.group,
                items: groupItem.items
                    .filter((item) => item !== "example")
                    .map((item) => `${WIDGET_URL_PREFIX}/${item}`)
                    .sort((a, b) => a.localeCompare(b))
            }));
            setWidgets(sortedWidgets);
        }

        init();
    }, []);

    return (
        <GeneralSettingsTabStyledContainer>
            <Select label="Default preview widget" data={widgets} />
            <Divider my="md" />
            <div className="tour-section">
                <Text size="sm">Tour</Text>
                <Button.Group>
                    <Button
                        variant="default"
                        leftSection={<i className="fas fa-compass" />}
                        onClick={() => dispatchTour("full")}
                    >
                        View Tour
                    </Button>
                    <Button
                        variant="default"
                        leftSection={<i className="fas fa-map" />}
                        onClick={() => dispatchTour("whats-new")}
                    >
                        What&apos;s New?
                    </Button>
                </Button.Group>
            </div>
        </GeneralSettingsTabStyledContainer>
    );
}
