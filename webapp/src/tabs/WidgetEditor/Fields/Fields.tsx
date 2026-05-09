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
import { useEffect, useState } from "preact/hooks";

import { AccordionItem } from "unichat/components/AccordionItem";
import { Button } from "unichat/components/Button";
import { GalleryFileInput } from "unichat/components/forms/GalleryFileInput";
import { NumberInput } from "unichat/components/forms/NumberInput";
import { Option, Select } from "unichat/components/forms/Select";
import { Switch } from "unichat/components/forms/Switch/index";
import { Textarea } from "unichat/components/forms/Textarea";
import { TextInput } from "unichat/components/forms/TextInput";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { UniChatWidget, WidgetFields } from "unichat/types";
import { Strings } from "unichat/utils/Strings";
import { isGeneralUserWidget, isSystemPluginWidget, isSystemWidget } from "unichat/utils/widgetSourceTypeGuards";

import { FieldsStyledContainer } from "./styled";

interface Props {
    widgets: Map<string, UniChatWidget>;
    selectedWidget: string;
    handleReset: () => Promise<void>;
    handleApply: (values: Record<string, unknown>) => Promise<void>;
}

const _logger = LoggerFactory.getLogger("Fields");
export function Fields({ handleApply, handleReset, selectedWidget, widgets }: Props): PReact.ComponentChildren {
    const [fields, setFields] = useState<Record<string, WidgetFields> | null>(null);
    const [fieldState, setFieldState] = useState<Record<string, unknown> | null>(null);
    const [openedItem, setOpenedItem] = useState<string | null>(null);

    function buildField(key: string, builder: WidgetFields): PReact.ComponentChildren {
        if (fieldState == null) {
            return null;
        }

        const value = fieldState[key] ?? ("value" in builder ? builder.value : null);

        switch (builder.type) {
            case "checkbox":
                return (
                    <Switch
                        key={key}
                        label={builder.label}
                        description={builder.description}
                        checked={value as boolean | undefined}
                        onChange={(evt) => setFieldState((old) => ({ ...old, [key]: evt.currentTarget.checked }))}
                    />
                );
            // case "colorpicker":
            //     return (
            //         <ColorPicker
            //             key={key}
            //             label={builder.label}
            //             description={builder.description}
            //             value={value}
            //             swatches={builder.swatches ?? []}
            //             onChange={(value) => setFieldState((old) => ({ ...old, [key]: value }))}
            //         />
            //     );
            case "dropdown": {
                return (
                    <Select
                        key={key}
                        label={builder.label}
                        description={builder.description}
                        value={value as string}
                        onChange={(value) => setFieldState((old) => ({ ...old, [key]: value }))}
                        options={Object.entries(builder.options).map(([value, label]) => ({ value, label }))}
                    />
                );
            }
            case "number":
                return (
                    <NumberInput
                        key={key}
                        label={builder.label}
                        description={builder.description}
                        min={builder.min}
                        max={builder.max}
                        step={builder.step}
                        value={value as number | undefined}
                        onChange={(evt) => setFieldState((old) => ({ ...old, [key]: evt.currentTarget.value }))}
                    />
                );
            case "textarea":
                return (
                    <Textarea
                        key={key}
                        label={builder.label}
                        description={builder.description}
                        value={value as string | undefined}
                        rows={3}
                        onChange={(evt) => setFieldState((old) => ({ ...old, [key]: evt.currentTarget.value }))}
                    />
                );
            case "filepicker":
                return (
                    <GalleryFileInput
                        label={builder.label}
                        description={builder.description}
                        value={value as string | undefined}
                        onChange={(evt) => setFieldState((old) => ({ ...old, [key]: evt.currentTarget.value }))}
                        showTabs={builder.fileType}
                    />
                );
            case "divider":
                return (
                    <div key={key} className="divider-wrapper">
                        <hr />
                        {builder.label && <span>{builder.label}</span>}
                    </div>
                );
            default:
                return (
                    <TextInput
                        key={key}
                        label={builder.label}
                        description={builder.description}
                        value={value as string | undefined}
                        onChange={(evt) => setFieldState((old) => ({ ...old, [key]: evt.currentTarget.value }))}
                    />
                );
        }
    }

    function buildFieldsEditor(): PReact.ComponentChildren {
        const widget = widgets.get(selectedWidget);

        if (isSystemWidget(widget)) {
            return <div className="empty-fields">No editable fields for system widgets.</div>;
        } else if (isSystemPluginWidget(widget)) {
            return <div className="empty-fields">No editable fields for system plugins widgets.</div>;
        } else if (fields == null || Object.keys(fields).length === 0) {
            return <div className="empty-fields">No fields defined for this widget.</div>;
        }

        const groups: Record<string, PReact.ComponentChild[]> = {
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

        return Object.entries(groups)
            .filter(([_, elements]) => elements.length > 0)
            .map(([groupName, elements]) => {
                return (
                    <AccordionItem
                        key={groupName}
                        header={groupName}
                        open={openedItem === groupName}
                        toggle={() => setOpenedItem((old) => (old === groupName ? null : groupName))}
                    >
                        {elements}
                    </AccordionItem>
                );
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

    async function wrappedReset(): Promise<void> {
        await handleReset();
        await handleFetchWidgetData();
    }

    useEffect(() => {
        handleFetchWidgetData();
    }, [selectedWidget]);

    return (
        <FieldsStyledContainer>
            <div className="fields--header">
                <span>Fields Editor</span>
                {fields != null && Object.keys(fields).length > 0 && (
                    <div className="fields--actions">
                        <Button variant="default" onClick={() => wrappedReset()}>
                            <i className="fas fa-undo" />
                        </Button>
                        <Button variant="primary" onClick={() => handleApply(fieldState ?? {})}>
                            Apply
                        </Button>
                    </div>
                )}
            </div>
            <div className="fields--content">{buildFieldsEditor()}</div>
        </FieldsStyledContainer>
    );
}
