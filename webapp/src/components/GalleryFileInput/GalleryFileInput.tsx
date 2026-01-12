/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { TextInput, TextInputProps } from "@mantine/core";
import { modals } from "@mantine/modals";

import { modalService } from "unichat/services/modalService";

import { Gallery, GalleryActions, GalleryTabs } from "../Gallery/Gallery";

interface Props extends Omit<TextInputProps, "ref"> {
    showTabs?: GalleryTabs[];
}

export const GalleryFileInput = React.forwardRef<HTMLInputElement, Props>(function GalleryFileInput(props, ref) {
    const { showTabs = [], onClick, onChange, ...rest } = props;

    const inputRef = React.useRef<HTMLInputElement>(null);

    function handleShowTabs(): GalleryTabs[] {
        let _showTabs = Array.isArray(showTabs) ? showTabs : [];
        if (_showTabs.length === 0) {
            _showTabs = ["image", "video", "audio", "file"];
        }

        return _showTabs;
    }

    function handleClick(event: React.MouseEvent<HTMLInputElement>): void {
        event.stopPropagation();

        const _showTabs = handleShowTabs();
        let wrappedSelectedTab: GalleryTabs = inputRef.current?.value.startsWith("http") ? "custom" : undefined;
        if (wrappedSelectedTab == null) {
            wrappedSelectedTab = (_showTabs ?? [])[0] ?? "image";
        }

        modalService.openModal({
            size: "xl",
            title: "Gallery",
            actions: <GalleryActions />,
            children: (
                <Gallery
                    showTabs={_showTabs}
                    startSelectedTab={wrappedSelectedTab}
                    selectedItem={inputRef.current?.value}
                    onSelectItem={(url) => {
                        if (inputRef.current) {
                            inputRef.current.value = url;

                            if (onChange) {
                                const syntheticEvent = {
                                    target: inputRef.current,
                                    currentTarget: inputRef.current
                                } as React.ChangeEvent<HTMLInputElement>;
                                onChange(syntheticEvent);
                            }

                            inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
                        }

                        modals.closeAll();
                    }}
                />
            )
        });

        if (onClick) {
            onClick(event);
        }
    }

    React.useEffect(() => {
        if (rest.defaultValue && inputRef.current) {
            inputRef.current.value = rest.defaultValue.toString();
        }
    }, [rest.defaultValue]);

    return (
        <TextInput
            {...rest}
            ref={(node) => {
                inputRef.current = node;

                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }}
            onClick={handleClick}
        />
    );
});
