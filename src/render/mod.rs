use tauri::{LogicalPosition, LogicalSize, Manager, WebviewBuilder, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_store::StoreBuilder;

use crate::youtube;

pub fn create_render<R: tauri::Runtime>(app: &tauri::App<R>, window: &tauri::Window<R>, label: &str, default_url: String) {
    let window_pos = window.inner_position().unwrap();
    let window_size = window.inner_size().unwrap();

    let pos = LogicalPosition::new(64, 0);
    let size = LogicalSize::new(window_size.width - 64, window_size.height);

    let settings_path = app.path().app_data_dir().unwrap().join("unichat.db");
    let store = StoreBuilder::new(app.handle(), settings_path).build();
    let url = store.load().ok().and_then(|_| store.get(format!("{label}-url")))
        .and_then(|parsed| parsed.as_str().map(|s| s.to_string())).unwrap_or(default_url);

    let webview_url = WebviewUrl::External(url.parse().unwrap());

    if app.get_webview(label).is_none() {
        if std::env::consts::OS != "linux" {
            let new_webview = window.add_child(WebviewBuilder::new(label, webview_url), pos, size).unwrap();
            new_webview.hide().unwrap();
        } else {
            let webview_window = app.get_webview_window("main").unwrap();

            let new_window = WebviewWindowBuilder::new(app, label, webview_url)
                .inner_size(size.width as f64, size.height as f64).position((window_pos.x + pos.x) as f64, (window_pos.y + pos.y) as f64)
                .resizable(false).decorations(false).parent(&webview_window).unwrap().build().unwrap();

            new_window.hide().unwrap();
        }
    }

    let webview = app.get_webview(label).unwrap();
    if label == "youtube-chat" && url != "about:blank" {
        webview.eval(youtube::SCRAPPING_JS).unwrap();
    }
}
