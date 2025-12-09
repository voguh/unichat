import React from "react";

import { TextInput, TextInputProps } from "@mantine/core";
import { modals } from "@mantine/modals";

import { Gallery, GalleryTabs } from "../Gallery/Gallery";

interface Props extends Omit<TextInputProps, "ref"> {
    showTabs?: GalleryTabs[];
    startSelectedTab?: Omit<GalleryTabs, "custom">;
}

export const GalleryFileInput = React.forwardRef<HTMLInputElement, Props>(function GalleryFileInput(props, ref) {
    const { showTabs, startSelectedTab, onClick, onChange, ...rest } = props;

    const inputRef = React.useRef<HTMLInputElement>(null);

    function handleShowTabs(): GalleryTabs[] {
        if (Array.isArray(showTabs) && showTabs.length > 0) {
            return [...showTabs, "custom"];
        }

        return ["image", "video", "audio", "file", "custom"];
    }

    function handleClick(event: React.MouseEvent<HTMLInputElement>): void {
        event.stopPropagation();

        let wrappedSelectedTab: GalleryTabs = inputRef.current?.value.startsWith("http") ? "custom" : undefined;
        if (wrappedSelectedTab == null) {
            wrappedSelectedTab = (startSelectedTab ?? showTabs?.[0] ?? "image") as GalleryTabs;
        }

        modals.open({
            title: "Gallery",
            size: "xl",
            children: (
                <Gallery
                    showTabs={handleShowTabs()}
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
