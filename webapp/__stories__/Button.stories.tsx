/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import styled from "styled-components";

import { Button, ButtonProps } from "unichat/components/Button";

const meta = {
    title: "Bootstrap/Button",
    component: Button,
    argTypes: {
        disabled: {
            type: "boolean"
        },
        variant: {
            type: "string",
            control: { type: "radio" },
            options: ["default", "filled", "outline", "light"]
        },
        color: {
            type: "string",
            control: { type: "select" },
            options: [
                "default",

                "gray",
                "red",
                "pink",
                "grape",
                "violet",
                "indigo",
                "blue",
                "cyan",
                "teal",
                "green",
                "lime",
                "yellow",
                "orange"
            ]
        },
        bsVariant: {
            type: "string",
            control: { type: "select" },
            options: [
                "primary",
                "outline-primary",
                "secondary",
                "outline-secondary",
                "success",
                "outline-success",
                "danger",
                "outline-danger",
                "warning",
                "outline-warning",
                "info",
                "outline-info",
                "light",
                "outline-light",
                "dark",
                "link"
            ]
        }
    },
    tags: ["autodocs"],
    args: { disabled: false, onClick: fn() }
} satisfies Meta<typeof Button>;

export const InteractiveButton: StoryObj<typeof meta> = {
    args: {
        children: "Button",
        variant: "filled",
        color: "blue"
    }
};

const AllVariantsTable = styled.table`
    margin: 0 auto;
    table-layout: fixed;
    border-collapse: collapse;

    > thead {
        > tr {
            > th {
                padding: 4px 8px;
                text-align: center;
                border: 1px solid black;
                background: var(--oc-dark-9);
                color: var(--oc-dark-0);
            }
        }
    }

    > tbody {
        > tr {
            &:nth-child(even) {
                background: rgba(var(--oc-dark-9-rgb), 0.25);
            }

            > td {
                padding: 4px 8px;
                border: 1px solid black;

                > div {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                }
            }
        }
    }
`;

export const AllVariants: StoryObj<typeof meta> = {
    tags: ["!autodocs"],
    render({ children: _children, ...rest }) {
        delete rest.variant;

        rest.style = { ...(rest.style ?? {}), textTransform: "capitalize" };

        function createButton(variant: ButtonProps["variant"], color?: ButtonProps["color"]): JSX.Element {
            return (
                <Button {...rest} variant={variant ?? undefined} color={color ?? undefined}>
                    {variant === "default" ? "Default" : `${variant ?? "filled"} ${color ?? "blue"}`}
                </Button>
            );
        }

        function createBootstrapButton(variant?: ButtonProps["bsVariant"]): JSX.Element {
            return (
                <Button {...rest} bsVariant={variant ?? undefined}>
                    Bootstrap {(variant ?? "default")?.replace("-", " ")}
                </Button>
            );
        }

        return (
            <AllVariantsTable>
                <thead>
                    <tr>
                        <th>UniChat Variants</th>
                        <th>Bootstrap Equivalence</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td />

                        <td>
                            <div>
                                {createBootstrapButton("light")}
                                {createBootstrapButton("outline-light")}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td />

                        <td>
                            <div>{createBootstrapButton("dark")}</div>
                        </td>
                    </tr>
                    <tr>
                        <td />

                        <td>
                            <div>{createBootstrapButton("link")}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>{createButton("default")}</div>
                        </td>

                        <td />
                    </tr>
                    <tr>
                        <td>
                            <div>
                                <Button disabled>Disabled</Button>
                            </div>
                        </td>

                        <td />
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "gray")}
                                {createButton("outline", "gray")}
                                {createButton("light", "gray")}
                            </div>
                        </td>

                        <td>
                            <div>
                                {createBootstrapButton("secondary")}
                                {createBootstrapButton("outline-secondary")}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "red")}
                                {createButton("outline", "red")}
                                {createButton("light", "red")}
                            </div>
                        </td>

                        <td>
                            <div>
                                {createBootstrapButton("danger")}
                                {createBootstrapButton("outline-danger")}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "pink")}
                                {createButton("outline", "pink")}
                                {createButton("light", "pink")}
                            </div>
                        </td>

                        <td />
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "grape")}
                                {createButton("outline", "grape")}
                                {createButton("light", "grape")}
                            </div>
                        </td>

                        <td />
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "violet")}
                                {createButton("outline", "violet")}
                                {createButton("light", "violet")}
                            </div>
                        </td>

                        <td />
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "indigo")}
                                {createButton("outline", "indigo")}
                                {createButton("light", "indigo")}
                            </div>
                        </td>

                        <td />
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "blue")}
                                {createButton("outline", "blue")}
                                {createButton("light", "blue")}
                            </div>
                        </td>

                        <td>
                            <div>
                                {createBootstrapButton(undefined)}
                                {createBootstrapButton("primary")}
                                {createBootstrapButton("outline-primary")}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "cyan")}
                                {createButton("outline", "cyan")}
                                {createButton("light", "cyan")}
                            </div>
                        </td>

                        <td>
                            <div>
                                {createBootstrapButton("info")}
                                {createBootstrapButton("outline-info")}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "teal")}
                                {createButton("outline", "teal")}
                                {createButton("light", "teal")}
                            </div>
                        </td>

                        <td />
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "green")}
                                {createButton("outline", "green")}
                                {createButton("light", "green")}
                            </div>
                        </td>

                        <td>
                            <div>
                                <td>{createBootstrapButton("success")}</td>
                                <td>{createBootstrapButton("outline-success")}</td>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "lime")}
                                {createButton("outline", "lime")}
                                {createButton("light", "lime")}
                            </div>
                        </td>

                        <td />
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "yellow")}
                                {createButton("outline", "yellow")}
                                {createButton("light", "yellow")}
                            </div>
                        </td>

                        <td>
                            <div>
                                {createBootstrapButton("warning")}
                                {createBootstrapButton("outline-warning")}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                {createButton("filled", "orange")}
                                {createButton("outline", "orange")}
                                {createButton("light", "orange")}
                            </div>
                        </td>

                        <td />
                    </tr>
                </tbody>
            </AllVariantsTable>
        );
    }
};

export default meta;
