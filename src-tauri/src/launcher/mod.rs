use std::collections::HashMap;
use std::process::Command;

fn system_to_core() -> HashMap<&'static str, &'static str> {
    let mut map = HashMap::new();
    map.insert("NES", "fceumm_libretro");
    map.insert("SNES", "snes9x_libretro");
    map.insert("Game Boy", "mgba_libretro");
    map.insert("Game Boy Color", "mgba_libretro");
    map.insert("Game Boy Advance", "mgba_libretro");
    map.insert("Nintendo 64", "mupen64plus_next_libretro");
    map.insert("Sega Genesis", "genesis_plus_gx_libretro");
    map.insert("Game Gear", "genesis_plus_gx_libretro");
    map.insert("Master System", "genesis_plus_gx_libretro");
    map
}

pub fn launch_game(
    retroarch_path: &str,
    rom_path: &str,
    system: &str,
) -> Result<(), String> {
    let core_map = system_to_core();

    let core_name = core_map
        .get(system)
        .ok_or_else(|| format!("No core found for system: {}", system))?;

    let cores_dir = std::path::Path::new(retroarch_path)
        .parent()
        .ok_or("Invalid RetroArch path")?
        .join("cores")
        .join(format!("{}.dll", core_name));

    let core_path = cores_dir.to_string_lossy().to_string();

    Command::new(retroarch_path)
        .args(["-L", &core_path, rom_path])
        .spawn()
        .map_err(|e| format!("Failed to launch: {}", e))?;

    Ok(())
}