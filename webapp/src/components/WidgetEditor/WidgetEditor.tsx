/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import {
    Accordion,
    Button,
    Card,
    Checkbox,
    ComboboxItemGroup,
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

import type { UniChatEvent, UniChatPlatform } from "unichat-widgets/unichat";
import { ColorPicker } from "unichat/components/ColorPicker";
import { commandService } from "unichat/services/commandService";
import { UniChatWidget, WidgetFields } from "unichat/types";
import { WIDGET_URL_PREFIX } from "unichat/utils/constants";
import { Strings } from "unichat/utils/Strings";
import {
    isGeneralUserWidget,
    isSystemPluginWidget,
    isSystemWidget,
    isUserWidget
} from "unichat/utils/widgetSourceTypeGuards";

import { GalleryFileInput } from "../GalleryFileInput";
import { WidgetEditorStyledContainer } from "./styled";
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
    const [selectedWidget, setSelectedWidget] = React.useState<string>("default");
    const [widgets, setWidgets] = React.useState<Map<string, UniChatWidget>>(new Map());

    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    function buildField(key: string, builder: WidgetFields): JSX.Element {
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
                        onChange={(evt) => setFieldState((old) => ({ ...old, [key]: evt.currentTarget.checked }))}
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
            case "divider":
                return (
                    <div key={key} className="divider-wrapper">
                        <Divider />
                        {builder.label && <Text size="sm">{builder.label}</Text>}
                    </div>
                );
            case "filepicker":
                return (
                    <div key={key} className="filepicker-wrapper">
                        <GalleryFileInput
                            label={builder.label}
                            description={builder.description}
                            defaultValue={value}
                            onChange={(evt) => setFieldState((old) => ({ ...old, [key]: evt.currentTarget.value }))}
                            showTabs={builder.fileType}
                        />
                    </div>
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
    }

    function buildFieldsEditor(): React.ReactNode {
        if (isSystemWidget(widgets.get(selectedWidget))) {
            return <div className="empty-fields">No editable fields for system widgets.</div>;
        } else if (isSystemPluginWidget(widgets.get(selectedWidget))) {
            return <div className="empty-fields">No editable fields for system plugins widgets.</div>;
        } else if (fields == null || Object.keys(fields).length === 0) {
            return <div className="empty-fields">No fields defined for this widget.</div>;
        }

        const groups: Record<string, JSX.Element[]> = {
            Ungrouped: []
        };

        const filteredFields = Object.entries(fields).filter(([_, value]) => typeof value === "object");
        for (const [key, value] of filteredFields) {
            const group = value.group ?? "Ungrouped";
            if (!groups[group]) {
                groups[group] = [];
            }

            groups[group].push(buildField(key, value));
        }

        const firstSelectedGroup = Object.entries(groups)
            .filter(([_, elements]) => elements.length > 0)
            .map(([k]) => k)[0];

        return (
            <Accordion variant="separated" chevronIconSize={18} defaultValue={firstSelectedGroup}>
                {Object.entries(groups)
                    .filter(([_, elements]) => elements.length > 0)
                    .map(([groupName, elements]) => {
                        return (
                            <Accordion.Item key={groupName} value={groupName}>
                                <Accordion.Control>{groupName}</Accordion.Control>
                                <Accordion.Panel>{elements}</Accordion.Panel>
                            </Accordion.Item>
                        );
                    })}
            </Accordion>
        );
    }

    /* ====================================================================== */

    function toOptions(widgets: Map<string, UniChatWidget>): ComboboxItemGroup<string>[] {
        const systemWidgets = [];
        const userWidgets = [];
        const pluginWidgets = [];

        for (const widget of widgets.values()) {
            if (isSystemWidget(widget)) {
                systemWidgets.push({ value: widget.restPath, label: widget.restPath });
            } else if (isUserWidget(widget)) {
                userWidgets.push({ value: widget.restPath, label: widget.restPath });
            } else {
                pluginWidgets.push({ value: widget.restPath, label: widget.restPath });
            }
        }

        const options: ComboboxItemGroup<string>[] = [];

        if (systemWidgets.length > 0) {
            options.push({
                group: "System Widgets",
                items: systemWidgets.sort((a, b) => a.label.localeCompare(b.label))
            });
        }
        if (userWidgets.length > 0) {
            options.push({ group: "User Widgets", items: userWidgets.sort((a, b) => a.label.localeCompare(b.label)) });
        }
        if (pluginWidgets.length > 0) {
            options.push({
                group: "Plugin Widgets",
                items: pluginWidgets.sort((a, b) => a.label.localeCompare(b.label))
            });
        }

        return options;
    }

    /* ====================================================================== */

    function dispatchEmulatedEvent<T extends UniChatEvent>(
        eventType: T["type"],
        requirePlatform?: UniChatPlatform
    ): void {
        if (requirePlatform == null && emulationMode !== "mixed") {
            requirePlatform = emulationMode as UniChatPlatform;
        }

        buildEmulatedEventData<T>(eventType, requirePlatform).then((data) => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                const detail = { type: eventType, data };
                iframeRef.current.contentWindow.postMessage({ type: "unichat:event", detail }, "*");
            }
        });
    }

    async function handleFetchWidgetData(): Promise<void> {
        if (!Strings.isNullOrEmpty(selectedWidget) && isGeneralUserWidget(widgets.get(selectedWidget))) {
            const fields = await commandService.getWidgetFields(selectedWidget).catch(() => ({}));
            const fieldstate = await commandService.getWidgetFieldState(selectedWidget).catch(() => ({}));

            setFields(fields);
            setFieldState(fieldstate);
        } else {
            setFields({});
            setFieldState({});
        }
    }

    async function handleFetchWidgets(): Promise<void> {
        const widgets = await commandService.listDetailedWidgets();

        const widgetsMap = new Map(widgets.filter((w) => w.restPath !== "example").map((w) => [w.restPath, w]));
        setWidgets(widgetsMap);
    }

    async function reloadIframe(): Promise<void> {
        await commandService.reloadWidgets();
        await handleFetchWidgets();

        if (iframeRef.current) {
            iframeRef.current.src = `${WIDGET_URL_PREFIX}/${selectedWidget}`;
            handleFetchWidgetData();
        }
    }

    async function handleReset(): Promise<void> {
        try {
            if (!Strings.isNullOrEmpty(selectedWidget)) {
                await commandService.setWidgetFieldState(selectedWidget, {});
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
            logger$error("An error occurred on save 'fieldstate.json'", err);
            notifications.show({
                title: "Error",
                message: `Failed to apply widget field state: ${(err as Error).message}`,
                color: "red"
            });
        }
    }

    async function handleApply(): Promise<void> {
        try {
            if (!Strings.isNullOrEmpty(selectedWidget)) {
                await commandService.setWidgetFieldState(selectedWidget, fieldState);
                reloadIframe();
                notifications.show({
                    title: "Success",
                    message: "Widget field state applied.",
                    color: "green",
                    position: "top-center"
                });
            }
        } catch (err) {
            logger$error("An error occurred on save 'fieldstate.json'", err);
            notifications.show({
                title: "Error",
                message: `Failed to apply widget field state: ${(err as Error).message}`,
                color: "red"
            });
        }
    }

    React.useEffect(() => {
        handleFetchWidgetData();
    }, [selectedWidget]);

    React.useEffect(() => {
        async function init(): Promise<void> {
            await handleFetchWidgets();
        }

        init();
    }, []);

    return (
        <WidgetEditorStyledContainer>
            <Card className="preview-header" withBorder shadow="xs">
                <div className="preview-header-widget-selector">
                    <Select
                        value={selectedWidget}
                        data={toOptions(widgets)}
                        allowDeselect={false}
                        onChange={setSelectedWidget}
                        disabled={widgets.size === 0}
                        placeholder={widgets.size === 0 ? "No user widgets available" : "Select a widget"}
                    />
                </div>

                <Tooltip label="Reload widget view" position="left" withArrow>
                    <Button onClick={reloadIframe}>
                        <i className="fas fa-sync" />
                    </Button>
                </Tooltip>
            </Card>
            <div className="editor-area">
                <div className="editor-area-header">
                    <div>Fields</div>
                    {Object.keys(fields).length > 0 && (
                        <>
                            <Button
                                size="xs"
                                variant="default"
                                leftSection={<i className="fas fa-undo" />}
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                            <Button
                                size="xs"
                                color="green"
                                leftSection={<i className="fas fa-check" />}
                                onClick={handleApply}
                            >
                                Apply
                            </Button>
                        </>
                    )}
                </div>
                <div className="editor-fields">{buildFieldsEditor()}</div>
            </div>
            <div className="preview-area">
                <iframe ref={iframeRef} src={`${WIDGET_URL_PREFIX}/${selectedWidget}`} sandbox="allow-scripts" />
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
                        <i className="fas fa-eraser" />
                    </Button>
                </div>

                <div className="emulator-events-dispatcher" data-tour="widget-editor-emulator-events-dispatcher">
                    <Text size="sm">Emit Events</Text>
                    <Button.Group orientation="vertical">
                        <Button
                            variant="default"
                            leftSection={<i className="fas fa-comment" />}
                            onClick={() => dispatchEmulatedEvent("unichat:message")}
                        >
                            Message
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<i className="fas fa-money-bill-wave" />}
                            onClick={() => dispatchEmulatedEvent("unichat:donate")}
                        >
                            Donate
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<i className="fas fa-star" />}
                            onClick={() => dispatchEmulatedEvent("unichat:sponsor")}
                        >
                            Sponsor
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<i className="fas fa-meteor" />}
                            onClick={() => dispatchEmulatedEvent("unichat:sponsor_gift")}
                        >
                            Sponsor Gift
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<i className="fas fa-user-friends" />}
                            onClick={() => dispatchEmulatedEvent("unichat:raid")}
                        >
                            Raid
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<i className="fas fa-box" />}
                            onClick={() => dispatchEmulatedEvent("unichat:redemption", "twitch")}
                        >
                            Redemption
                        </Button>
                    </Button.Group>
                </div>
            </div>
        </WidgetEditorStyledContainer>
    );
}
