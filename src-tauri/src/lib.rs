mod scanner;
mod db;
mod launcher;

use scanner::ScannedGame;
use db::Game;

#[tauri::command]
fn ping() -> String {
    "pong from Rust".to_string()
}

#[tauri::command(rename_all = "camelCase")]
fn scan_roms(folder_path: String) -> Vec<ScannedGame> {
    scanner::scan_folder(&folder_path)
}

#[tauri::command]
fn save_library(games: Vec<ScannedGame>) -> String {
    match db::save_games(&games) {
        Ok(count) => format!("{} games saved", count),
        Err(e) => format!("Error: {}", e),
    }
}

#[tauri::command]
fn load_library() -> Vec<Game> {
    db::load_games().unwrap_or_default()
}

#[tauri::command(rename_all = "camelCase")]
fn launch_game(
    retroarch_path: String,
    rom_path: String,
    system: String,
) -> Result<(), String> {
    launcher::launch_game(&retroarch_path, &rom_path, &system)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    db::init_db().expect("failed to init db");
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            ping,
            scan_roms,
            save_library,
            load_library,
            launch_game
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}