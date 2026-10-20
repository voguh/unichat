/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

declare module "*.module.css" {
    const styles: Record<string, string>;
    export default styles;
}

// Empty on purpose: never widens *.module.css imports to any.
declare module "*.css" {}
