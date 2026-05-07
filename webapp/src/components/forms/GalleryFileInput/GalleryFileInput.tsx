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
import { useEffect, useRef } from "preact/hooks";

import { GalleryModalActions, GalleryModal, GalleryTabs } from "unichat/__internal__/GalleryModal";
import { TextInput } from "unichat/components/forms/TextInput";
import { modalService } from "unichat/services/modalService";
import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { FormGroupBaseProps } from "../FormGroup";

type VanillaProps = Omit<PReact.InputHTMLAttributes<HTMLInputElement>, "type">;
interface GalleryInputProps extends VanillaProps, FormGroupBaseProps {
    showTabs?: GalleryTabs[];
    inputRef?: PReact.Ref<HTMLInputElement>;
}

export function GalleryFileInput({
    showTabs = [],
    onClick,
    onChange,
    inputRef,
    ...props
}: GalleryInputProps): PReact.ComponentChildren {
    const innerRef = useRef<HTMLInputElement>(null);

    function handleShowTabs(): GalleryTabs[] {
        let _showTabs = Array.isArray(showTabs) ? showTabs : [];
        if (_showTabs.length === 0) {
            _showTabs = ["image", "video", "audio", "file"];
        }

        return _showTabs;
    }

    function handleClick(event: PReact.TargetedMouseEvent<HTMLInputElement>): void {
        event.stopPropagation();

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
                        if (innerRef.current) {
                            innerRef.current.value = url;

                            if (onChange) {
                                const syntheticEvent = {
                                    target: innerRef.current,
                                    currentTarget: innerRef.current
                                } as unknown as PReact.TargetedEvent<HTMLInputElement, Event>;
                                onChange(syntheticEvent);
                            }

                            innerRef.current.dispatchEvent(new Event("input", { bubbles: true }));
                        }

                        context.close();
                    }}
                />
            )
        });

        if (onClick) {
            onClick(event);
        }
    }

    useEffect(() => {
        if (props.defaultValue && innerRef.current) {
            innerRef.current.value = props.defaultValue.toString();
        }
    }, [props.defaultValue]);

    return <TextInput {...props} ref={captureNativeRef(HTMLInputElement, inputRef, innerRef)} onClick={handleClick} />;
}
