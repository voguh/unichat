use tauri::{LogicalPosition, LogicalSize, Manager, WebviewBuilder, WebviewUrl};
use tauri_plugin_sql::{DbInstances, Migration, MigrationKind};

const DATABASE_KEY: &str = "sqlite:unichat.db";

#[tauri::command]
async fn select_from_settings(app: tauri::AppHandle, key: &str) -> Result<String, String> {
    let instances = app.state::<DbInstances>().inner().0.lock().await;
    let pool = instances.get(DATABASE_KEY).unwrap();

    let query = sqlx::query_as("SELECT * FROM 'settings' WHERE key = ?").bind(key);
    let result: Result<(String, String), sqlx::Error> = query.fetch_one(pool).await;

    result.map(|value| value.1).map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_in_settings(app: tauri::AppHandle, key: &str, value: &str) -> Result<(), String> {
    let instances = app.state::<DbInstances>().inner().0.lock().await;
    let pool = instances.get(DATABASE_KEY).unwrap();

    let exists_query = sqlx::query_as("SELECT key FROM 'settings' WHERE key = ?").bind(key);
    let exists_result: Result<(String,), sqlx::Error> = exists_query.fetch_one(pool).await;
    let exists = exists_result.map_or(false, |value| value.0 == key);

    let query;
    if exists {
        query = sqlx::query("UPDATE 'settings' value = ? WHERE key = ?").bind(value).bind(key);
    } else {
        query = sqlx::query("INSERT INTO 'settings'(key, value) VALUES (?, ?)").bind(key).bind(value);
    }

    query.execute(pool).await.map(|_| ()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn show_webview(app: tauri::AppHandle, label: &str) -> Result<(), String> {
    let webview = app.get_webview(label).unwrap();
    webview.show().map(|_| ()).map_err(|_| format!("An error occurred on try to show \"{}\" webview", label))
}

#[tauri::command]
async fn hide_webview(app: tauri::AppHandle, label: &str) -> Result<(), String> {
    let webview = app.get_webview(label).unwrap();
    webview.hide().map(|_| ()).map_err(|_| format!("An error occurred on try to show \"{}\" webview", label))
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
    let migrations = vec![Migration {
        version: 1,
        description: "create_settings_table",
        sql: "CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT)",
        kind: MigrationKind::Up
    }];

    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_sql::Builder::default().add_migrations(DATABASE_KEY, migrations).build())
        .invoke_handler(tauri::generate_handler![select_from_settings,save_in_settings,show_webview,hide_webview])
        .run(tauri::generate_context!())
        .expect("Error while running UniChat application");
}
