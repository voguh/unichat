// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greeting(name: &str) -> String {
    format!("Greetings {}, hello world!", name)
}

fn setup(_app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    println!("Tauri setup");
    Ok(())
}

fn main() {
    tauri::Builder::default().setup(setup)
        .invoke_handler(tauri::generate_handler![greeting])
        .run(tauri::generate_context!())
        .expect("An error occurred on run UniChat");
}
