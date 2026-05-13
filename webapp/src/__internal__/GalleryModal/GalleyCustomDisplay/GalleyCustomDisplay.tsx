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
import { useContext, useEffect, useRef, useState } from "preact/hooks";

import { Button } from "unichat/components/Button";
import { TextInput } from "unichat/components/forms/TextInput";
import { ModalContext } from "unichat/contexts/ModalContext";
import { GalleryItem } from "unichat/types";

import { GalleyCustomDisplayStyledContainer } from "./styled";

interface Props {
    selectedItem?: string;
    onSelectItem: (url: string, context: { close: () => void }) => void;
}

function testImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = document.createElement("img");

        img.onload = function () {
            resolve(true);
        };

        img.onerror = function () {
            resolve(false);
        };

        img.src = url;
    });
}

function testVideo(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const video = document.createElement("video");

        video.onloadeddata = function () {
            resolve(true);
        };
        video.onerror = function () {
            resolve(false);
        };

        video.src = url;
    });
}

function testAudio(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const audio = document.createElement("audio");

        audio.onloadeddata = function () {
            resolve(true);
        };
        audio.onerror = function () {
            resolve(false);
        };

        audio.src = url;
    });
}

export function GalleyCustomDisplay(props: Props): PReact.ComponentChildren {
    const { onSelectItem, selectedItem } = props;

    const [tempType, setTempType] = useState<GalleryItem["type"]>("image");
    const [tempURL, setTempURL] = useState("");

    const { onClose } = useContext(ModalContext);

    const inputRef = useRef<HTMLInputElement>(null);

    async function handleApply(): Promise<void> {
        if (inputRef.current) {
            const url = inputRef.current.value.trim();
            if ((url ?? "").length === 0) {
                return;
            }

            const tests = [
                { type: "image", test: testImage },
                { type: "video", test: testVideo },
                { type: "audio", test: testAudio },
                { type: "file", test: async () => true }
            ];

            for (const { test, type } of tests) {
                if (await test(url)) {
                    setTempType(type as GalleryItem["type"]);
                    setTempURL(url);

                    break;
                }
            }
        }
    }

    function renderPreview(): PReact.ComponentChildren {
        if ((tempURL ?? "").trim().length > 0) {
            if (tempType === "image") {
                return <img src={tempURL} />;
            } else if (tempType === "video") {
                return <video src={tempURL} controls />;
            } else if (tempType === "audio") {
                return <audio src={tempURL} controls />;
            }
        }

        return <img src="https://placehold.co/600x400?text=No+Preview" alt="No Preview Available" />;
    }

    useEffect(() => {
        if (selectedItem && selectedItem.startsWith("http")) {
            if (inputRef.current) {
                inputRef.current.value = selectedItem;
                handleApply();
            }
        }
    }, []);

    return (
        <GalleyCustomDisplayStyledContainer>
            <div className="media-wrapper">{renderPreview()}</div>

            <div className="input-wrapper">
                <TextInput ref={inputRef} label="Media URL" placeholder="Enter media URL" defaultValue={tempURL} />
                <Button onClick={handleApply}>
                    <i className="fas fa-check" />
                </Button>
            </div>

            {(tempURL ?? "").trim().length > 0 && (
                <Button
                    variant="secondary"
                    onClick={() => {
                        if (typeof onSelectItem === "function") {
                            onSelectItem(tempURL, { close: onClose });
                        }
                    }}
                >
                    Select
                </Button>
            )}
        </GalleyCustomDisplayStyledContainer>
    );
}
