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
import { useMemo } from "preact/hooks";

import { Marked, Token } from "marked";

import { clsx } from "unichat/utils/clsx";

import { MarkdownStyledContainer } from "./styled";

interface Props extends Omit<PReact.HTMLAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML"> {
    content: string | null;
    relativeLinksBaseUrl?: string;
}

const colorPatterns = [
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/,
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    /^hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)$/
];

function isColor(text: string): boolean {
    return colorPatterns.some((p) => p.test(text.trim()));
}

function tokenIsLink(token: Token): token is import("marked").Tokens.Link {
    return token.type === "link";
}

export function Markdown({ content, relativeLinksBaseUrl, ...rest }: Props): PReact.ComponentChildren {
    const marked = useMemo(() => {
        const marked = new Marked();

        marked.use({
            renderer: {
                codespan({ text }) {
                    if (isColor(text)) {
                        const color = text.trim();
                        return `<code>${color}<span style="display:inline-block;width:.65rem;height:.65rem;border-radius:50%;background:${color};margin-left:.5rem;vertical-align:middle;"></span></code>`;
                    }

                    return false;
                }
            },
            walkTokens(token) {
                if (tokenIsLink(token)) {
                    const href = token.href;
                    if (href.startsWith("./")) {
                        const normalizedHref = href.slice(2);
                        const dummyBaseUrl = `${window.location.protocol}//${window.location.host}`;
                        token.href = `${relativeLinksBaseUrl ?? dummyBaseUrl}/${normalizedHref}`;
                    }
                }
            }
        });

        return (str: string) => marked.parse(str, { async: false, gfm: true });
    }, [relativeLinksBaseUrl]);

    if (content == null) {
        return null;
    }

    return (
        <MarkdownStyledContainer
            {...rest}
            className={clsx("prose prose-invert max-w-none overflow-y-auto", rest.className)}
            dangerouslySetInnerHTML={{ __html: marked(content) }}
        />
    );
}
