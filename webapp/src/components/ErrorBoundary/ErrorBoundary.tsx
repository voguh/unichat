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

import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { ErrorBoundaryStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

interface State {
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

const _logger = LoggerFactory.getLogger("ErrorBoundary");
export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
            errorInfo: null
        };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({ error, errorInfo });
    }

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { error };
    }

    public componentDidUpdate(prevProps: Props): void {
        if (this.state.error && prevProps.children !== this.props.children) {
            this.setState({ error: null, errorInfo: null });
        }
    }

    public render(): React.ReactNode {
        const { error, errorInfo } = this.state;

        if (error) {
            return (
                <ErrorBoundaryStyledContainer>
                    Error: {error.message}
                    Component Stack:
                    {errorInfo?.componentStack || "No component stack available."}
                </ErrorBoundaryStyledContainer>
            );
        }

        return this.props.children;
    }
}
