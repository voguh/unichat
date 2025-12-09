import React from "react";

import { TextInput, TextInputProps } from "@mantine/core";
import { modals } from "@mantine/modals";

import { GalleryItem } from "unichat/types";

import { Gallery } from "../Gallery/Gallery";

interface Props extends Omit<TextInputProps, "ref"> {
    showTabs?: (GalleryItem["type"] | "custom")[];
    startSelectedTab?: GalleryItem["type"];
}

export const GalleryFileInput = React.forwardRef<HTMLInputElement, Props>(function GalleryFileInput(props, ref) {
    const { showTabs, startSelectedTab, onClick, onChange, ...rest } = props;

    const inputRef = React.useRef<HTMLInputElement>(null);

    function handleShowTabs(): (GalleryItem["type"] | "custom")[] {
        if (Array.isArray(showTabs) && showTabs.length > 0) {
            return [...showTabs, "custom"];
        }

        return ["image", "video", "audio", "file", "custom"];
    }

    function handleClick(event: React.MouseEvent<HTMLInputElement>): void {
        event.stopPropagation();

        modals.open({
            title: "Gallery",
            size: "xl",
            children: (
                <Gallery
                    showTabs={handleShowTabs()}
                    startSelectedTab={(startSelectedTab ?? showTabs?.[0] ?? "image") as GalleryItem["type"]}
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
