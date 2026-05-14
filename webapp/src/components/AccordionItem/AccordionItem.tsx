/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import PReact from "preact";

import { clsx } from "unichat/utils/clsx";

import { AccordionItemStyledContainer } from "./styled";

interface Props extends PReact.HTMLAttributes<HTMLDivElement> {
    open: boolean;
    toggle: () => void;
    header: PReact.ComponentChildren;
}

export function AccordionItem({ header, open, toggle, children, ...props }: Props): PReact.ComponentChildren {
    return (
        <AccordionItemStyledContainer {...props} className={clsx("accordion-item", props.className)}>
            <div className="accordion-header" onClick={() => toggle()}>
                <div className="accordion-title">{header}</div>
                <div className="accordion-aside">
                    {open ? <i className="fas fa-chevron-up" /> : <i className="fas fa-chevron-down" />}
                </div>
            </div>

            {open && <div className="accordion-content">{children}</div>}
        </AccordionItemStyledContainer>
    );
}
