/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

mod assets;
mod gallery;
mod proxy;
mod rpc;
mod widget;
mod ws;

pub use assets::assets;
pub use gallery::gallery;
pub use proxy::proxy;
pub use rpc::rpc;
pub use widget::get_widget;
pub use widget::get_widget_assets;
pub use ws::ws;
