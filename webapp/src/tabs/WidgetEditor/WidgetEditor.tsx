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

import { revealItemInDir } from "@tauri-apps/plugin-opener";
import Accordion from "react-bootstrap/Accordion";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Card from "react-bootstrap/Card";

import { UniChatEvent, UniChatPlatform } from "unichat-widgets/unichat";
import { GalleryModal, GalleryModalActions } from "unichat/__internal__/GalleryModal";
import { Button } from "unichat/components/Button";
import { Checkbox } from "unichat/components/forms/Checkbox";
import { ColorPicker } from "unichat/components/forms/ColorPicker";
import { NumberInput } from "unichat/components/forms/NumberInput";
import { Select } from "unichat/components/forms/Select";
import { Textarea } from "unichat/components/forms/Textarea";
import { TextInput } from "unichat/components/forms/TextInput";
import { GalleryFileInput } from "unichat/components/GalleryFileInput";
import { Tooltip } from "unichat/components/OverlayTrigger";
import { useWidgets } from "unichat/hooks/useWidgets";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { notificationService } from "unichat/services/notificationService";
import { WidgetFields } from "unichat/types";
import { WIDGET_URL_PREFIX } from "unichat/utils/constants";
import { Strings } from "unichat/utils/Strings";
import { toWidgetOptionGroup } from "unichat/utils/toWidgetOptionGroup";
import { isGeneralUserWidget, isSystemPluginWidget, isSystemWidget } from "unichat/utils/widgetSourceTypeGuards";

import { WidgetEditorStyledContainer } from "./styled";
import { buildEmulatedEventData } from "./util/buildEmulatedEventData";

interface Props {
    children?: React.ReactNode;
}

const _logger = LoggerFactory.getLogger("WidgetEditor");
export function WidgetEditor(_props: Props): React.ReactNode {
    const [emulationMode, setEmulationMode] = React.useState<UniChatPlatform | "mixed">("mixed");

    const [fields, setFields] = React.useState<Record<string, WidgetFields>>({});
    const [fieldState, setFieldState] = React.useState<Record<string, any>>({});
    const [selectedWidget, setSelectedWidget] = React.useState<string>("default");

    const [widgets, reloadWidgets] = useWidgets((ws) => new Map(ws.map((w) => [w.restPath, w])), new Map());
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    function buildField(key: string, builder: WidgetFields): JSX.Element {
        const value = fieldState[key] ?? ("value" in builder ? builder.value : null);

        switch (builder.type) {
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
                        options={Object.entries(builder.options).map(([value, label]) => ({ value, label }))}
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
                        <hr />
                        {builder.label && <span>{builder.label}</span>}
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
            <Accordion defaultActiveKey={firstSelectedGroup}>
                {Object.entries(groups)
                    .filter(([_, elements]) => elements.length > 0)
                    .map(([groupName, elements]) => {
                        return (
                            <Accordion.Item key={groupName} eventKey={groupName}>
                                <Accordion.Header>{groupName}</Accordion.Header>
                                <Accordion.Body>{elements}</Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
            </Accordion>
        );
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

    async function reloadIframe(): Promise<void> {
        await reloadWidgets();

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
                notificationService.success({ title: "Success", message: "Widget field state reset." });
            }
        } catch (err) {
            _logger.error("An error occurred on save 'fieldstate.json'", err);
            notificationService.error({
                title: "Error",
                message: `Failed to apply widget field state: ${(err as Error).message}`
            });
        }
    }

    async function handleApply(): Promise<void> {
        try {
            if (!Strings.isNullOrEmpty(selectedWidget)) {
                await commandService.setWidgetFieldState(selectedWidget, fieldState);
                reloadIframe();
                notificationService.success({ title: "Success", message: "Widget field state applied." });
            }
        } catch (err) {
            _logger.error("An error occurred on save 'fieldstate.json'", err);
            notificationService.error({
                title: "Error",
                message: `Failed to apply widget field state: ${(err as Error).message}`
            });
        }
    }

    React.useEffect(() => {
        handleFetchWidgetData();
    }, [selectedWidget]);

    return (
        <WidgetEditorStyledContainer>
            <Card className="preview-header">
                <div className="preview-header-widget-selector">
                    <Select
                        value={{ label: selectedWidget, value: selectedWidget }}
                        options={toWidgetOptionGroup(widgets.values())}
                        onChange={(option) => setSelectedWidget(option!.value)}
                    />
                </div>

                <Tooltip content="Reload widget view" placement="left">
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
                            <Button variant="default" onClick={handleReset}>
                                <i className="fas fa-undo" />
                                Reset
                            </Button>
                            <Button color="green" onClick={handleApply}>
                                <i className="fas fa-check" />
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
                        value={{ label: emulationMode, value: emulationMode }}
                        label="Emulation Mode"
                        options={[
                            { value: "mixed", label: "Mixed" },
                            { value: "twitch", label: "Twitch Only" },
                            { value: "youtube", label: "YouTube Only" }
                        ]}
                        onChange={(option) => setEmulationMode(option!.value as UniChatPlatform | "mixed")}
                    />
                    <Button variant="default" onClick={() => dispatchEmulatedEvent("unichat:clear")}>
                        <i className="fas fa-eraser" />
                    </Button>
                </div>

                <div className="emulator-events-dispatcher" data-tour="widget-editor-emulator-events-dispatcher">
                    <div className="emulator-events-title">Emit Events</div>
                    <ButtonGroup vertical>
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
                    </ButtonGroup>
                </div>
            </div>
        </WidgetEditorStyledContainer>
    );
}

export function WidgetEditorLeftSection(_props: Props): React.ReactNode {
    function toggleGallery(): void {
        modalService.openModal({
            size: "xl",
            title: "Gallery",
            actions: <GalleryModalActions />,
            children: <GalleryModal />
        });
    }

    return (
        <>
            <Tooltip content="Open user widgets folder" placement="right">
                <Button onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)} data-tour="user-widgets-directory">
                    <i className="fas fa-folder" />
                </Button>
            </Tooltip>
            <Tooltip content="Gallery" placement="right">
                <Button onClick={toggleGallery} data-tour="gallery-toggle">
                    <i className="fas fa-images" />
                </Button>
            </Tooltip>
        </>
    );
}
