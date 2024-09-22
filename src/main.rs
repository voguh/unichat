// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn open_devtools(app: tauri::AppHandle) {
    let window = app.get_window("main").unwrap();
    window.open_devtools();
}

fn setup(_app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    println!("Tauri setup");
    Ok(())
}

fn main() {
    tauri::Builder::default().setup(setup)
        .invoke_handler(tauri::generate_handler![open_devtools])
        .run(tauri::generate_context!())
        .expect("An error occurred on run UniChat");
}
