/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useRef, useState } from "preact/hooks";

import { TextInput, type TextInputProps } from "@voguh/unichat-ui/forms/TextInput";
import { GalleryModal, GalleryModalActions, type GalleryTabs } from "unichat/__internal__/GalleryModal";
import { modalService } from "unichat/services/modalService";
import { mergeRefs } from "unichat/utils/mergeRefs";

interface GalleryInputProps extends Omit<TextInputProps, "type"> {
    showTabs?: GalleryTabs[];
    inputRef?: PReact.Ref<HTMLInputElement>;
}

export function GalleryFileInput({
    showTabs,
    inputRef,
    value,
    defaultValue,
    onClick,
    ...props
}: GalleryInputProps): PReact.ComponentChildren {
    const isControlled = value !== undefined;

    const [innerValue, setInnerValue] = useState(() => value ?? defaultValue ?? "");
    const currentValue = isControlled ? value : innerValue;

    const innerRef = useRef<HTMLInputElement>(null);

    function handleShowTabs(): GalleryTabs[] {
        if (Array.isArray(showTabs) && showTabs.length > 0) {
            return showTabs;
        }

        return ["image", "video", "audio", "file"];
    }

    function handleClick(event: PReact.TargetedMouseEvent<HTMLInputElement>): void {
        try {
            const _showTabs = handleShowTabs();

            let selectedItem: string | undefined;
            let wrappedSelectedTab = _showTabs[0];
            if (innerRef.current != null) {
                selectedItem = innerRef.current.value;
                if (selectedItem.startsWith("http")) {
                    wrappedSelectedTab = "custom";
                }
            }

            modalService.openModal({
                size: "xl",
                title: "Gallery",
                actions: <GalleryModalActions />,
                children: (
                    <GalleryModal
                        showTabs={_showTabs}
                        startSelectedTab={wrappedSelectedTab}
                        selectedItem={selectedItem}
                        onSelectItem={(url, context) => {
                            try {
                                if (!isControlled) {
                                    setInnerValue(url);
                                }

                                const inputEl = innerRef.current;
                                if (inputEl != null) {
                                    inputEl.value = url;
                                    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
                                }
                            } finally {
                                context.close();
                            }

                            context.close();
                        }}
                    />
                )
            });
        } finally {
            if (typeof onClick === "function") {
                onClick(event);
            }
        }
    }

    return (
        <TextInput
            {...props}
            value={currentValue}
            ref={mergeRefs(inputRef, innerRef)}
            readOnly
            type="text"
            onClick={handleClick}
        />
    );
}
