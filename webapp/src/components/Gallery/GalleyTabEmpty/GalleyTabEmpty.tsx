/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Text } from "@mantine/core";

import { GalleyTabEmptyStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

export function GalleyTabEmpty(_props: Props): React.ReactNode {
    return (
        <GalleyTabEmptyStyledContainer>
            <Text fw={500} size="lg" mt="xs">
                No items to display
            </Text>
        </GalleyTabEmptyStyledContainer>
    );
}
