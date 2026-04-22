use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScannedGame {
    pub title: String,
    pub system: String,
    pub rom_path: String,
}

fn extension_to_system() -> HashMap<&'static str, &'static str> {
    let mut map = HashMap::new();
    map.insert("nes", "NES");
    map.insert("smc", "SNES");
    map.insert("sfc", "SNES");
    map.insert("gba", "Game Boy Advance");
    map.insert("gbc", "Game Boy Color");
    map.insert("gb", "Game Boy");
    map.insert("n64", "Nintendo 64");
    map.insert("z64", "Nintendo 64");
    map.insert("v64", "Nintendo 64");
    map.insert("nds", "Nintendo DS");
    map.insert("md", "Sega Genesis");
    map.insert("gen", "Sega Genesis");
    map.insert("smd", "Sega Genesis");
    map.insert("gg", "Game Gear");
    map.insert("sms", "Master System");
    map.insert("pce", "TurboGrafx-16");
    map.insert("iso", "PlayStation");
    map.insert("bin", "PlayStation");
    map.insert("cue", "PlayStation");
    map
}

pub fn scan_folder(folder_path: &str) -> Vec<ScannedGame> {
    let ext_map = extension_to_system();
    let mut games = Vec::new();

    for entry in WalkDir::new(folder_path)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if !entry.file_type().is_file() {
            continue;
        }

        let path = entry.path();

        let ext = match path.extension() {
            Some(e) => e.to_string_lossy().to_lowercase(),
            None => continue,
        };

        let system = match ext_map.get(ext.as_str()) {
            Some(s) => s.to_string(),
            None => continue,
        };

        let title = path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let rom_path = path.to_string_lossy().to_string();

        games.push(ScannedGame {
            title,
            system,
            rom_path,
        });
    }

    games
}