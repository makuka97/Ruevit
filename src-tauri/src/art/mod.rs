use std::path::PathBuf;

fn get_cache_dir() -> PathBuf {
    let mut path = dirs::data_local_dir().unwrap();
    path.push("ruevit");
    path.push("art");
    std::fs::create_dir_all(&path).unwrap();
    path
}

fn system_to_libretro_folder(system: &str) -> Option<&'static str> {
    match system {
        "NES" => Some("Nintendo%20-%20NES"),
        "SNES" => Some("Nintendo%20-%20Super%20Nintendo"),
        "Game Boy" => Some("Nintendo%20-%20Game%20Boy"),
        "Game Boy Color" => Some("Nintendo%20-%20Game%20Boy%20Color"),
        "Game Boy Advance" => Some("Nintendo%20-%20Game%20Boy%20Advance"),
        "Nintendo 64" => Some("Nintendo%20-%20Nintendo%2064"),
        "Sega Genesis" => Some("Sega%20-%20Mega%20Drive%20-%20Genesis"),
        "Game Gear" => Some("Sega%20-%20Game%20Gear"),
        "Master System" => Some("Sega%20-%20Master%20System%20-%20Mark%20III"),
        "PlayStation" => Some("Sony%20-%20PlayStation"),
        "TurboGrafx-16" => Some("NEC%20-%20PC%20Engine%20-%20TurboGrafx-16"),
        _ => None,
    }
}

pub fn fetch_art(title: &str, system: &str) -> Option<String> {
    let cache_dir = get_cache_dir();
    let safe_title = title.replace("/", "_").replace("\\", "_");
    let cache_path = cache_dir.join(format!("{}.png", safe_title));

    if cache_path.exists() {
        return Some(cache_path.to_string_lossy().to_string());
    }

    let folder = system_to_libretro_folder(system)?;
    let encoded_title = urlencoding::encode(title);
    let url = format!(
        "https://thumbnails.libretro.com/{}/Named_Boxarts/{}.png",
        folder, encoded_title
    );

    let response = reqwest::blocking::get(&url).ok()?;
    if !response.status().is_success() {
        return None;
    }

    let bytes = response.bytes().ok()?;
    std::fs::write(&cache_path, &bytes).ok()?;

    Some(cache_path.to_string_lossy().to_string())
}