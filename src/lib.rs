use tauri::{LogicalPosition, LogicalSize, Manager, PhysicalSize, WebviewBuilder, WebviewUrl};

#[tauri::command]
async fn show_webview(app: tauri::AppHandle, label: &str) -> Result<(), String> {
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
    webview.show().map(|_| ()).map_err(|_| format!("An error occurred on try to show \"{}\" webview", label))
}

#[tauri::command]
async fn hide_webview(app: tauri::AppHandle, label: &str) -> Result<(), String> {
    let window = app.get_window("main").unwrap();
    let window_size = window.inner_size().unwrap();

    for (key, value) in app.webviews() {
        if key != "main" && key != label {
            value.hide().unwrap();
        }
    }

    app.get_webview("main").unwrap().set_size(window_size).map(|_| ()).map_err(|_| format!("An error occurred on try to show \"{}\" webview", label))
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    println!("Tauri setup");

    let window = app.get_window("main").unwrap();
    let window_size = window.inner_size().unwrap();

    let pos_x = 8 + 48 + 8;
    let pos_y = 8;
    let width = window_size.width - (pos_x + 8);
    let height = window_size.height - (pos_y + 8);
    let url = WebviewUrl::External("about:blank".parse().unwrap());
    let pos = LogicalPosition::new(pos_x, pos_y);
    let size = LogicalSize::new(width, height);

    let youtube_chat = window.add_child(WebviewBuilder::new("youtube-chat", url.clone()), pos, size).unwrap();
    let twitch_chat = window.add_child(WebviewBuilder::new("twitch-chat", url.clone()), pos, size).unwrap();

    youtube_chat.hide().unwrap();
    twitch_chat.hide().unwrap();

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![show_webview,hide_webview])
        .run(tauri::generate_context!())
        .expect("Error while running UniChat application");
}
