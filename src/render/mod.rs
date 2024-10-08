use tauri::{LogicalPosition, LogicalSize, Manager, WebviewBuilder, WebviewUrl, WebviewWindowBuilder};

pub fn create_render<R: tauri::Runtime>(app: &tauri::App<R>, window: &tauri::Window<R>, label: &str, url: WebviewUrl) {
    let window_pos = window.inner_position().unwrap();
    let window_size = window.inner_size().unwrap();

    let pos = LogicalPosition::new(64, 0);
    let size = LogicalSize::new(window_size.width - 64, window_size.height);

    if app.get_webview(label).is_none() {
        if std::env::consts::OS != "linux" {
            let new_webview = window.add_child(WebviewBuilder::new(label, url), pos, size).unwrap();
            new_webview.hide().unwrap();
        } else {
            let webview_window = app.get_webview_window("main").unwrap();

            let new_window = WebviewWindowBuilder::new(app, label, url)
                .inner_size(size.width as f64, size.height as f64).position((window_pos.x + pos.x) as f64, (window_pos.y + pos.y) as f64)
                .resizable(false).decorations(false).parent(&webview_window).unwrap().build().unwrap();

            new_window.hide().unwrap();
        }
    }
}
