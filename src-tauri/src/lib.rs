use std::fs;
use std::path::PathBuf;

fn settings_path() -> Result<PathBuf, String> {
    let home = std::env::var("HOME").map_err(|_| "HOME environment variable is not set".to_string())?;
    Ok(PathBuf::from(home).join(".config/keyhub/settings.json"))
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn settings_path_string() -> Result<String, String> {
    settings_path().map(|path| path.to_string_lossy().to_string())
}

#[tauri::command]
fn read_settings() -> Result<String, String> {
    let path = settings_path()?;
    fs::read_to_string(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn write_settings(contents: String) -> Result<(), String> {
    let path = settings_path()?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    let temp_path = path.with_extension("json.tmp");
    fs::write(&temp_path, contents).map_err(|error| error.to_string())?;

    fs::rename(&temp_path, &path).map_err(|error| {
        let _ = fs::remove_file(&temp_path);
        error.to_string()
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            settings_path_string,
            read_settings,
            write_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
