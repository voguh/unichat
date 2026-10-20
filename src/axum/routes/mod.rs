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
mod fontawesome;
mod gallery;
mod not_found;
mod proxy;
mod rpc;
mod widget;
mod ws;

pub use assets::assets;
pub use fontawesome::fontawesome;
pub use gallery::gallery;
pub use not_found::not_found;
pub use proxy::proxy;
pub use rpc::rpc;
pub use widget::get_widget_assets;
pub use widget::get_widget_css;
pub use widget::get_widget_js;
pub use widget::get_widget;
pub use ws::ws;
