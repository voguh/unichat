pub mod constants;

pub fn is_dev() -> bool {
    return cfg!(debug_assertions) || tauri::is_dev();
}
