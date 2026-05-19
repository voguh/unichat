/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { ComponentType, HTMLAttributes } from "preact";

import { styled } from "goober";
import tw from "twin.macro";

export const BadgeStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`inline-flex items-center gap-1 rounded bg-stone-800/90 text-xs font-semibold text-stone-50 px-1 py-0.5`
});
