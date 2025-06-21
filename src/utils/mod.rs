pub mod constants;
pub mod properties;
pub mod settings;

pub fn is_dev() -> bool {
    return cfg!(debug_assertions) || tauri::is_dev();
}

pub fn parse_serde_error(error: serde_json::Error) -> Box<dyn std::error::Error> {
    return Box::new(error);
}
