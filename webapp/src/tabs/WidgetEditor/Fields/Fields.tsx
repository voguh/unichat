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

import { ColorPicker } from "@voguh/unichat-ui/components/forms/ColorPicker";
import { NumberInput } from "@voguh/unichat-ui/components/forms/NumberInput";
import { Select } from "@voguh/unichat-ui/components/forms/Select";
import { Switch } from "@voguh/unichat-ui/components/forms/Switch";
import { Textarea } from "@voguh/unichat-ui/components/forms/Textarea";
import { TextInput } from "@voguh/unichat-ui/components/forms/TextInput";
import { Accordion } from "@voguh/unichat-ui/components/ui/Accordion";
import { Button } from "@voguh/unichat-ui/components/ui/Button";
import { parseColor } from "@voguh/unichat-ui/utils/colorUtils";
import { GalleryFileInput } from "unichat/components/forms/GalleryFileInput";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import type { WidgetFields } from "unichat/types";
import type { WidgetMetadata } from "unichat/types/widgets";
import { Strings } from "unichat/utils/Strings";
import { isGeneralUserWidget, isSystemWidget } from "unichat/utils/widgetSourceTypeGuards";

import styles from "./styles.module.css";

interface Props {
    widgets: Map<string, WidgetMetadata>;
    selectedWidget: string;
    handleReset: () => Promise<void>;
    handleApply: (values: Record<string, unknown>) => Promise<void>;
}

const _logger = LoggerFactory.getLogger("Fields");
export function Fields({ handleApply, handleReset, selectedWidget, widgets }: Props): PReact.ComponentChildren {
    const [fields, setFields] = useState<Record<string, WidgetFields> | null>(null);
    const [fieldState, setFieldState] = useState<Record<string, unknown> | null>(null);

    function buildField(key: string, builder: WidgetFields): PReact.ComponentChildren {
        if (fieldState == null) {
            return null;
        }

        const value = fieldState[key] ?? ("value" in builder ? builder.value : null);

        switch (builder.type) {
            case "checkbox":
            case "switch":
                return (
                    <Switch
                        key={key}
                        label={builder.label}
                        description={builder.description}
                        checked={value as boolean}
                        onChange={(event) => {
                            const checked = event.currentTarget.checked;
                            setFieldState((old) => ({ ...old, [key]: checked }));
                        }}
                    />
                );
            case "colorpicker":
                return (
                    <ColorPicker
                        key={key}
                        label={builder.label}
                        description={builder.description}
                        value={value ? parseColor(value as string) : undefined}
                        swatches={builder.swatches ?? []}
                        onValueChange={({ valueAsString }) =>
                            setFieldState((old) => ({ ...old, [key]: valueAsString }))
                        }
                    />
                );
            case "dropdown": {
                return (
                    <Select
                        key={key}
                        label={builder.label}
                        description={builder.description}
                        value={[value as string]}
                        onValueChange={({ value }) => setFieldState((old) => ({ ...old, [key]: value[0] }))}
                        items={Object.entries(builder.options).map(([value, label]) => ({ value, label }))}
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
                        value={value != null ? String(value) : undefined}
                        onValueChange={({ value }) => setFieldState((old) => ({ ...old, [key]: value }))}
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
            return <div className={styles.empty}>No editable fields for system widgets.</div>;
        } else if (fields == null || Object.keys(fields).length === 0) {
            return <div className={styles.empty}>No fields defined for this widget.</div>;
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

        return (
            <Accordion.Root className={styles.accordion}>
                {Object.entries(groups)
                    .filter(([_, elements]) => elements.length > 0)
                    .map(([groupName, elements]) => (
                        <Accordion.Item
                            key={groupName}
                            name="widget-fields"
                            title={groupName}
                            className={styles.accordionItem}
                            contentProps={{ className: styles.accordionContent }}
                        >
                            {elements}
                        </Accordion.Item>
                    ))}
            </Accordion.Root>
        );
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

    // biome-ignore lint/correctness/useExhaustiveDependencies: componentDidMount
    useEffect(() => {
        handleFetchWidgetData();
    }, [selectedWidget]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span>Fields Editor</span>
                {fields != null && Object.keys(fields).length > 0 && (
                    <div className={styles.actions}>
                        <Button variant="default" size="sm" onClick={() => wrappedReset()}>
                            <i className="fas fa-undo" />
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleApply(fieldState ?? {})}>
                            Apply
                        </Button>
                    </div>
                )}
            </div>
            <div className={styles.content}>{buildFieldsEditor()}</div>
        </div>
    );
}
