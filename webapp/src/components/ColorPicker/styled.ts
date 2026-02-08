/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Input } from "@mantine/core";
import styled from "styled-components";

export const ColorPickerStyledContainer = styled(Input.Wrapper)`
    position: relative;

    > .colorpicker-inputgroup {
        display: flex;
        gap: 8px;

        > .mantine-Input-wrapper {
            flex: 1;
        }

        > .color-preview {
            position: relative;
            width: 36px;
            height: 36px;
            border-radius: var(--mantine-radius-default);
            overflow: hidden;
            background-image:
                linear-gradient(45deg, rgb(66, 66, 66) 25%, rgba(0, 0, 0, 0) 25%),
                linear-gradient(-45deg, rgb(66, 66, 66) 25%, rgba(0, 0, 0, 0) 25%),
                linear-gradient(45deg, rgba(0, 0, 0, 0) 75%, rgb(66, 66, 66) 75%),
                linear-gradient(-45deg, rgb(36, 36, 36) 75%, rgb(66, 66, 66) 75%);
            background-position-x:
                0px,
                0px,
                4px,
                -4px;
            background-position-y:
                0px,
                4px,
                -4px,
                0px;
            background-size:
                8px 8px,
                8px 8px,
                8px 8px,
                8px 8px;

            > div {
                width: 100%;
                height: 100%;
            }

            > span {
                position: absolute;
                inset: 0;
                box-shadow:
                    rgba(0, 0, 0, 0.1) 0px 0px 0px 1px inset,
                    rgba(0, 0, 0, 0.15) 0px 0px 4px 0px inset;
            }
        }
    }

    > .colorpicker-picker-wrapper {
        position: absolute;
        z-index: 10;
        bottom: calc(36px + 4px);
        left: 0;
        padding: 8px;
        background: var(--mantine-color-dark-6);
    }
`;
