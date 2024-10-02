use tauri::{Manager, PhysicalPosition, PhysicalSize, WebviewBuilder, WebviewUrl, WebviewWindowBuilder, Window, WindowEvent};

mod youtube;

#[tauri::command]
fn show_webview(app: tauri::AppHandle, label: &str) {
    if std::env::consts::OS != "linux" {
        let window = app.get_window("main").unwrap();
        let window_size = window.inner_size().unwrap();

        for (key, value) in app.webviews() {
            if key != "main" && key != label {
                value.hide().unwrap();
            }
        }

        let size = PhysicalSize::new(64, window_size.height);
        app.get_webview("main").unwrap().set_size(size).unwrap();

        let webview = app.get_webview(label).unwrap();
        webview.show().unwrap();
    } else {
        for (key, value) in app.webview_windows() {
            if key != "main" && key != label {
                value.hide().unwrap();
            }
        }

        let webview_window = app.get_webview_window(label).unwrap();
        webview_window.show().unwrap();
    }
}

#[tauri::command]
fn hide_webviews(app: tauri::AppHandle) {
    if std::env::consts::OS != "linux" {
        let window = app.get_window("main").unwrap();
        let window_size = window.inner_size().unwrap();

        for (key, value) in app.webviews() {
            if key != "main" {
                value.hide().unwrap();
            }
        }

        let webview = app.get_webview("main").unwrap();
        webview.set_size(window_size).unwrap();
    } else {
        for (key, value) in app.webview_windows() {
            if key != "main" {
                value.hide().unwrap();
            }
        }
    }
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    println!("Tauri setup");

    let window = app.get_window("main").unwrap();
    let window_pos = window.inner_position().unwrap();
    let window_size = window.inner_size().unwrap();

    let youtube_url = WebviewUrl::External("https://youtube.com".parse().unwrap());
    let twitch_url = WebviewUrl::External("https://twitch.tv".parse().unwrap());
    let pos = PhysicalPosition::new(64, 0);
    let size = PhysicalSize::new(window_size.width - 64, window_size.height);

    if std::env::consts::OS != "linux" {
        let youtube_chat = window.add_child(WebviewBuilder::new("youtube-chat", youtube_url), pos, size).unwrap();
        let twitch_chat = window.add_child(WebviewBuilder::new("twitch-chat", twitch_url), pos, size).unwrap();

        youtube_chat.hide().unwrap();
        twitch_chat.hide().unwrap();

        youtube_chat.eval(youtube::SCRAPPING_JS).unwrap();
    } else {
        let webview_window = app.get_webview_window("main").unwrap();

        let youtube_chat = WebviewWindowBuilder::new(app, "youtube-chat", youtube_url)
            .inner_size(size.width as f64, size.height as f64).position((window_pos.x + pos.x) as f64, (window_pos.y + pos.y) as f64)
            .resizable(false).decorations(false).parent(&webview_window).unwrap().build().unwrap();

        let twitch_chat = WebviewWindowBuilder::new(app, "twitch-chat", twitch_url)
            .inner_size(size.width as f64, size.height as f64).position((window_pos.x + pos.x) as f64, (window_pos.y + pos.y) as f64)
            .resizable(false).decorations(false).parent(&webview_window).unwrap().build().unwrap();

        youtube_chat.hide().unwrap();
        twitch_chat.hide().unwrap();

        youtube_chat.eval(youtube::SCRAPPING_JS).unwrap();
        youtube_chat.open_devtools();
    }

    Ok(())
}

fn on_window_event(window: &Window, event: &WindowEvent) {
    if std::env::consts::OS == "linux" && window.label() == "main" {
        let app = window.app_handle();

        match event {
            WindowEvent::Moved(window_pos) => {
                let pos = PhysicalPosition::new(window_pos.x + 64, window_pos.y);
                for (key, window) in app.windows() {
                    if key != "main" {
                        window.set_position(pos).unwrap();
                    }
                }
            }
            WindowEvent::Resized(window_size) => {
                let size = PhysicalSize::new(window_size.width - 64, window_size.height);
                for (key, window) in app.windows() {
                    if key != "main" {
                        window.set_size(size).unwrap()
                    }
                }
            }
            WindowEvent::Destroyed => {
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
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![show_webview,hide_webviews,youtube::on_message])
        .on_window_event(on_window_event)
        .run(tauri::generate_context!())
        .expect("Error while running UniChat application");
}
