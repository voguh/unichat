/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import {
    Button,
    Card,
    Checkbox,
    Divider,
    Input,
    NumberInput,
    Select,
    Slider,
    Text,
    Textarea,
    TextInput,
    Tooltip
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    IconAffiliate,
    IconCheck,
    IconEraser,
    IconMessage,
    IconMoneybag,
    IconReload,
    IconRestore,
    IconStar,
    IconStars
} from "@tabler/icons-react";

import type { UniChatEvent, UniChatPlatform } from "unichat-widgets/unichat";
import { ColorPicker } from "unichat/components/ColorPicker";
import { commandService } from "unichat/services/commandService";
import { loggerService } from "unichat/services/loggerService";
import { WidgetFields } from "unichat/types";
import { WIDGET_URL_PREFIX } from "unichat/utils/constants";
import { Strings } from "unichat/utils/Strings";

import { WidgetEditorEmptyStyledContainer, WidgetEditorStyledContainer } from "./styled";
import { buildEmulatedEventData } from "./util/buildEmulatedEventData";

export interface WidgetMetadata {
    fields: Record<string, WidgetFields>;
    fieldstate: Record<string, any>;
    html: string;
    js: string;
    css: string;
}

interface Props {
    children?: React.ReactNode;
}

export function WidgetEditor(_props: Props): React.ReactNode {
    const [emulationMode, setEmulationMode] = React.useState<UniChatPlatform | "mixed">("mixed");

    const [fields, setFields] = React.useState<Record<string, WidgetFields>>({});
    const [fieldState, setFieldState] = React.useState<Record<string, any>>({});
    const [selectedWidgetUrl, setSelectedWidgetUrl] = React.useState("");
    const [widgets, setWidgets] = React.useState<string[]>([]);

    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    function buildFieldsEditor(): React.ReactNode {
        if (fields == null || Object.keys(fields).length === 0) {
            return <div>No fields defined for this widget.</div>;
        }

        return Object.entries(fields)
            .filter(([key, value]) => key !== "$schema" && typeof value === "object")
            .map(([key, builder]) => {
                const value = fieldState[key] ?? ("value" in builder ? builder.value : null);

                switch (builder.type) {
                    case "slider":
                        return (
                            <Input.Wrapper>
                                <Slider
                                    value={value}
                                    step={builder.step ?? 0.1}
                                    min={builder.min ?? 0}
                                    max={builder.max ?? 100}
                                    onChange={(value) => setFieldState((old) => ({ ...old, [key]: value }))}
                                />
                            </Input.Wrapper>
                        );
                    case "checkbox":
                        return (
                            <Checkbox
                                key={key}
                                label={builder.label}
                                description={builder.description}
                                checked={value}
                                onChange={(evt) =>
                                    setFieldState((old) => ({ ...old, [key]: evt.currentTarget.checked }))
                                }
                            />
                        );
                    case "colorpicker":
                        return (
                            <ColorPicker
                                key={key}
                                label={builder.label}
                                description={builder.description}
                                value={value}
                                withPickerFree={builder.withPickerFree ?? true}
                                swatches={builder.swatches ?? []}
                                onChange={(value) => setFieldState((old) => ({ ...old, [key]: value }))}
                            />
                        );
                    case "dropdown":
                        return (
                            <Select
                                key={key}
                                label={builder.label}
                                description={builder.description}
                                value={value}
                                onChange={(value) => setFieldState((old) => ({ ...old, [key]: value }))}
                                data={Object.entries(builder.options).map(([value, label]) => ({ value, label }))}
                            />
                        );
                    case "number":
                        return (
                            <NumberInput
                                key={key}
                                label={builder.label}
                                description={builder.description}
                                value={value}
                                onChange={(value) => setFieldState((old) => ({ ...old, [key]: value }))}
                                min={builder.min}
                                max={builder.max}
                                step={builder.step}
                            />
                        );
                    case "divider":
                        return (
                            <div key={key} className="divider-wrapper">
                                <Divider />
                                {builder.label && <Text size="sm">{builder.label}</Text>}
                            </div>
                        );
                    case "textarea":
                        return (
                            <Textarea
                                key={key}
                                label={builder.label}
                                description={builder.description}
                                value={value}
                                rows={3}
                                onChange={(evt) => setFieldState((old) => ({ ...old, [key]: evt.currentTarget.value }))}
                            />
                        );
                    default:
                        return (
                            <TextInput
                                key={key}
                                label={builder.label}
                                description={builder.description}
                                value={value}
                                onChange={(evt) => setFieldState((old) => ({ ...old, [key]: evt.currentTarget.value }))}
                            />
                        );
                }
            });
    }

    /* ====================================================================== */

    function dispatchEmulatedEvent<T extends UniChatEvent>(eventType: T["type"]): void {
        const requirePlatform = emulationMode === "mixed" ? null : (emulationMode as UniChatPlatform);

        buildEmulatedEventData<T>(eventType, requirePlatform).then((data) => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                const detail = { type: eventType, data };
                iframeRef.current.contentWindow.postMessage({ type: "unichat:event", detail }, "*");
            }
        });
    }

    async function handleFetchWidgetData(): Promise<void> {
        const widgetName = (selectedWidgetUrl ?? "").replace(`${WIDGET_URL_PREFIX}/`, "");

        if (!Strings.isNullOrEmpty(widgetName)) {
            const fields = await commandService.getWidgetFields(widgetName).catch(() => ({}));
            const fieldstate = await commandService.getWidgetFieldState(widgetName).catch(() => ({}));

            setFields(fields);
            setFieldState(fieldstate);
        } else {
            setFields({});
            setFieldState({});
        }
    }

    async function handleFetchWidgets(): Promise<string[]> {
        const widgets = await commandService.listWidgets();

        return widgets
            .filter((itemGroup) => itemGroup.group === "User Widgets")
            .flatMap((itemGroup) => itemGroup.items)
            .filter((item) => item !== "example")
            .map((item) => `${WIDGET_URL_PREFIX}/${item}`)
            .sort((a, b) => a.localeCompare(b));
    }

    async function reloadIframe(): Promise<void> {
        const widgets = await handleFetchWidgets();
        setWidgets(widgets);

        if (iframeRef.current) {
            iframeRef.current.src = selectedWidgetUrl;
            handleFetchWidgetData();
        }
    }

    async function handleReset(): Promise<void> {
        try {
            const widgetName = (selectedWidgetUrl ?? "").replace(`${WIDGET_URL_PREFIX}/`, "");

            if (!Strings.isNullOrEmpty(widgetName)) {
                await commandService.setWidgetFieldState(widgetName, {});
                setFieldState({});
                reloadIframe();
                notifications.show({
                    title: "Success",
                    message: "Widget field state reset.",
                    color: "green",
                    position: "top-center"
                });
            }
        } catch (err) {
            loggerService.error("An error occurred on save 'fieldstate.json'", err);
            notifications.show({
                title: "Error",
                message: `Failed to apply widget field state: ${(err as Error).message}`,
                color: "red"
            });
        }
    }

    async function handleApply(): Promise<void> {
        try {
            const widgetName = (selectedWidgetUrl ?? "").replace(`${WIDGET_URL_PREFIX}/`, "");

            if (!Strings.isNullOrEmpty(widgetName)) {
                await commandService.setWidgetFieldState(widgetName, fieldState);
                reloadIframe();
                notifications.show({
                    title: "Success",
                    message: "Widget field state applied.",
                    color: "green",
                    position: "top-center"
                });
            }
        } catch (err) {
            loggerService.error("An error occurred on save 'fieldstate.json'", err);
            notifications.show({
                title: "Error",
                message: `Failed to apply widget field state: ${(err as Error).message}`,
                color: "red"
            });
        }
    }

    React.useEffect(() => {
        handleFetchWidgetData();
    }, [selectedWidgetUrl]);

    React.useEffect(() => {
        async function init(): Promise<void> {
            const widgets = await handleFetchWidgets();
            setWidgets(widgets);

            if (widgets.length > 0) {
                setSelectedWidgetUrl(widgets[0]);
            }
        }

        init();
    }, []);

    if (
        Strings.isNullOrEmpty(selectedWidgetUrl) ||
        Strings.isNullOrEmpty(selectedWidgetUrl.replace(`${WIDGET_URL_PREFIX}/`, ""))
    ) {
        return (
            <WidgetEditorEmptyStyledContainer>
                <Card className="preview-header" withBorder shadow="xs">
                    <div className="preview-header-widget-selector">
                        <Select
                            value={selectedWidgetUrl}
                            data={widgets}
                            allowDeselect={false}
                            onChange={setSelectedWidgetUrl}
                        />
                    </div>

                    <Tooltip label="Reload widget view" position="left" withArrow>
                        <Button onClick={reloadIframe}>
                            <i className="fas fa-sync" />
                            <IconReload size="20" />
                        </Button>
                    </Tooltip>
                </Card>
                <Card withBorder shadow="xs">
                    <Text>Select a widget to edit its fields.</Text>
                </Card>
            </WidgetEditorEmptyStyledContainer>
        );
    }

    return (
        <WidgetEditorStyledContainer>
            <Card className="preview-header" withBorder shadow="xs">
                <div className="preview-header-widget-selector">
                    <Select
                        value={selectedWidgetUrl}
                        data={widgets}
                        allowDeselect={false}
                        onChange={setSelectedWidgetUrl}
                    />
                </div>

                <Tooltip label="Reload widget view" position="left" withArrow>
                    <Button onClick={reloadIframe}>
                        <i className="fas fa-sync" />
                        <IconReload size="20" />
                    </Button>
                </Tooltip>
            </Card>
            <div className="editor-area">
                <div className="editor-area-header">
                    <div>Fields</div>
                    <Button size="xs" variant="default" leftSection={<IconRestore size="20" />} onClick={handleReset}>
                        Reset
                    </Button>
                    <Button size="xs" color="green" leftSection={<IconCheck size="20" />} onClick={handleApply}>
                        Apply
                    </Button>
                </div>
                <div className="editor-fields">{buildFieldsEditor()}</div>
            </div>
            <div className="preview-area">
                <iframe ref={iframeRef} src={selectedWidgetUrl} sandbox="allow-scripts" />
                <div />
            </div>
            <div className="emulator-area">
                <div className="emulator-header">Emulator</div>

                <div className="emulator-operation-mode-select">
                    <Select
                        value={emulationMode}
                        label="Emulation Mode"
                        data={[
                            { value: "mixed", label: "Mixed" },
                            { value: "twitch", label: "Twitch Only" },
                            { value: "youtube", label: "YouTube Only" }
                        ]}
                        allowDeselect={false}
                        onChange={(value) => setEmulationMode(value as UniChatPlatform | "mixed")}
                    />
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:clear")}>
                        <IconEraser size="14" />
                    </Button>
                </div>

                <div className="emulator-events-dispatcher">
                    <Text size="sm">Emit Events</Text>
                    <Button.Group orientation="vertical">
                        <Button
                            variant="default"
                            leftSection={<IconMessage size="14" />}
                            onClick={() => dispatchEmulatedEvent("unichat:message")}
                        >
                            Message
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<IconMoneybag size="14" />}
                            onClick={() => dispatchEmulatedEvent("unichat:donate")}
                        >
                            Donate
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<IconStar size="14" />}
                            onClick={() => dispatchEmulatedEvent("unichat:sponsor")}
                        >
                            Sponsor
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<IconStars size="14" />}
                            onClick={() => dispatchEmulatedEvent("unichat:sponsor_gift")}
                        >
                            Sponsor Gift
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<IconAffiliate size="14" />}
                            onClick={() => dispatchEmulatedEvent("unichat:raid")}
                        >
                            Raid
                        </Button>
                    </Button.Group>
                </div>
            </div>
        </WidgetEditorStyledContainer>
    );
}
