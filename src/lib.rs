use tauri::{Manager, PhysicalPosition, PhysicalSize, WebviewBuilder, WebviewUrl, WebviewWindowBuilder};

mod commands;
mod youtube;

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    println!("Tauri setup");

    let window = app.get_window("main").unwrap();
    let window_pos = window.inner_position().unwrap();
    let window_size = window.inner_size().unwrap();

    let url = WebviewUrl::External("about:blank".parse().unwrap());
    let pos = PhysicalPosition::new(64, 0);
    let size = PhysicalSize::new(window_size.width - 64, window_size.height);

    if std::env::consts::OS != "linux" {
        let youtube_chat = window.add_child(WebviewBuilder::new("youtube-chat", url.clone()), pos, size).unwrap();
        let twitch_chat = window.add_child(WebviewBuilder::new("twitch-chat", url.clone()), pos, size).unwrap();

        youtube_chat.hide().unwrap();
        twitch_chat.hide().unwrap();
    } else {
        let webview_window = app.get_webview_window("main").unwrap();

        let youtube_chat = WebviewWindowBuilder::new(app, "youtube-chat", url.clone())
            .inner_size(size.width as f64, size.height as f64).position((window_pos.x + pos.x) as f64, (window_pos.y + pos.y) as f64)
            .resizable(false).decorations(false).parent(&webview_window).unwrap().build().unwrap();

        let twitch_chat = WebviewWindowBuilder::new(app, "twitch-chat", url.clone())
            .inner_size(size.width as f64, size.height as f64).position((window_pos.x + pos.x) as f64, (window_pos.y + pos.y) as f64)
            .resizable(false).decorations(false).parent(&webview_window).unwrap().build().unwrap();

        youtube_chat.hide().unwrap();
        twitch_chat.hide().unwrap();
    }

    Ok(())
}

fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if std::env::consts::OS == "linux" && window.label() == "main" {
        let app = window.app_handle();

        match event {
            tauri::WindowEvent::Moved(window_pos) => {
                let pos = PhysicalPosition::new(window_pos.x + 64, window_pos.y);
                for (key, window) in app.windows() {
                    if key != "main" {
                        window.set_position(pos).unwrap();
                    }
                }
            }
            tauri::WindowEvent::Resized(window_size) => {
                let size = PhysicalSize::new(window_size.width - 64, window_size.height);
                for (key, window) in app.windows() {
                    if key != "main" {
                        window.set_size(size).unwrap()
                    }
                }
            }
            tauri::WindowEvent::Destroyed => {
                for (key, window) in app.windows() {
                    if key != "main" {
                        window.destroy().unwrap();
                    }
                }
            }
            _ => {}
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::show_webview,
            commands::hide_webviews,
            commands::update_webview_url,
            youtube::on_message
        ])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .expect("Error while running UniChat application");
}
