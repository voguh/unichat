pub mod constants;
pub mod properties;
pub mod settings;

pub fn is_dev() -> bool {
    return cfg!(debug_assertions) || tauri::is_dev();
}
