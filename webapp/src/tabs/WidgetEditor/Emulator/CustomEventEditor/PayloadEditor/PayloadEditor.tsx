/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useRef } from "preact/hooks";

import styles from "./styles.module.css";

const TOKEN_REGEX = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g;

function highlight(source: string): PReact.ComponentChildren[] {
    const nodes: PReact.ComponentChildren[] = [];
    let last = 0;

    for (const match of source.matchAll(TOKEN_REGEX)) {
        nodes.push(source.slice(last, match.index));
        if (match[1] != null) {
            nodes.push(<span className={match[2] != null ? "key" : "string"}>{match[1]}</span>);
            nodes.push(match[2] ?? "");
        } else if (match[3] != null) {
            nodes.push(<span className="number">{match[3]}</span>);
        } else {
            nodes.push(<span className="literal">{match[4]}</span>);
        }

        last = match.index + match[0].length;
    }

    nodes.push(`${source.slice(last)}\n`);

    return nodes;
}

interface Props {
    value: string;
    invalid: boolean;
    onChange: (value: string) => void;
}

export function PayloadEditor({ value, invalid, onChange }: Props): PReact.ComponentChildren {
    const highlightRef = useRef<HTMLPreElement>(null);

    function syncScroll(event: PReact.TargetedUIEvent<HTMLTextAreaElement>): void {
        highlightRef.current!.scrollTop = event.currentTarget.scrollTop;
        highlightRef.current!.scrollLeft = event.currentTarget.scrollLeft;
    }

    function handleKeyDown(event: PReact.TargetedKeyboardEvent<HTMLTextAreaElement>): void {
        if (event.key === "Tab") {
            event.preventDefault();

            const textarea = event.currentTarget;
            textarea.setRangeText("  ", textarea.selectionStart, textarea.selectionEnd, "end");
            onChange(textarea.value);
        }
    }

    return (
        <div className={styles.root} data-invalid={invalid}>
            <pre ref={highlightRef} aria-hidden="true">
                {highlight(value)}
            </pre>
            <textarea
                value={value}
                spellcheck={false}
                aria-label="Event payload"
                onInput={(event) => onChange(event.currentTarget.value)}
                onScroll={syncScroll}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}
