// fn open_devtools(app: tauri::AppHandle) {
//     let window = app.get_window("main").unwrap();
//     window.open_devtools();
// }

fn setup(_app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    println!("Tauri setup");
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default().setup(setup)
        .plugin(tauri_plugin_shell::init())
        // .invoke_handler(tauri::generate_handler![open_devtools])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
