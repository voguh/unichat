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
import { useRef, useState } from "preact/hooks";

import { GalleryModalActions, GalleryModal, GalleryTabs } from "unichat/__internal__/GalleryModal";
import { TextInput } from "unichat/components/forms/TextInput";
import { modalService } from "unichat/services/modalService";
import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { FormGroupBaseProps } from "./FormGroup";

type VanillaProps = Omit<PReact.InputHTMLAttributes<HTMLInputElement>, "type">;
interface GalleryInputProps extends VanillaProps, FormGroupBaseProps {
    showTabs?: GalleryTabs[];
    inputRef?: PReact.Ref<HTMLInputElement>;
}

export function GalleryFileInput({
    showTabs = [],
    onClick,
    inputRef,
    value,
    defaultValue,
    ...props
}: GalleryInputProps): PReact.ComponentChildren {
    const isControlled = value !== undefined;

    const [innerValue, setInnerValue] = useState(() => value ?? defaultValue ?? "");
    const currentValue = isControlled ? value : innerValue;

    const innerRef = useRef<HTMLInputElement>(null);

    function handleShowTabs(): GalleryTabs[] {
        let _showTabs = Array.isArray(showTabs) ? showTabs : [];
        if (_showTabs.length === 0) {
            _showTabs = ["image", "video", "audio", "file"];
        }

        return _showTabs;
    }

    function handleClick(event: PReact.TargetedMouseEvent<HTMLInputElement>): void {
        try {
            const _showTabs = handleShowTabs();
            let wrappedSelectedTab: GalleryTabs | null = innerRef.current?.value.startsWith("http") ? "custom" : null;
            if (wrappedSelectedTab == null) {
                wrappedSelectedTab = (_showTabs ?? [])[0] ?? "image";
            }

            modalService.openModal({
                size: "xl",
                title: "Gallery",
                actions: <GalleryModalActions />,
                children: (
                    <GalleryModal
                        showTabs={_showTabs}
                        startSelectedTab={wrappedSelectedTab}
                        selectedItem={innerRef.current?.value}
                        onSelectItem={(url, context) => {
                            try {
                                const inputEl = innerRef.current;

                                if (!isControlled) {
                                    setInnerValue(url);

                                    if (inputEl != null) {
                                        inputEl.value = url;
                                    }
                                }

                                if (inputEl != null) {
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
            inputRef={captureNativeRef(HTMLInputElement, inputRef, innerRef)}
            readOnly
            onClick={handleClick}
        />
    );
}
