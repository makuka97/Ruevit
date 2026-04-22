use rusqlite::{Connection, Result};
use crate::scanner::ScannedGame;
use serde::Serialize;

#[derive(Debug, Serialize, Clone)]
pub struct Game {
    pub id: i64,
    pub title: String,
    pub system: String,
    pub rom_path: String,
}

pub fn get_db_path() -> String {
    let mut path = dirs::data_local_dir().unwrap();
    path.push("ruevit");
    std::fs::create_dir_all(&path).unwrap();
    path.push("library.db");
    path.to_string_lossy().to_string()
}

pub fn init_db() -> Result<()> {
    let conn = Connection::open(get_db_path())?;
    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            system TEXT NOT NULL,
            rom_path TEXT NOT NULL UNIQUE
        );
    ")?;
    Ok(())
}

pub fn save_games(games: &[ScannedGame]) -> Result<usize> {
    let conn = Connection::open(get_db_path())?;
    let mut count = 0;
    for game in games {
        let result = conn.execute(
            "INSERT OR IGNORE INTO games (title, system, rom_path)
             VALUES (?1, ?2, ?3)",
            (&game.title, &game.system, &game.rom_path),
        );
        if result.is_ok() {
            count += 1;
        }
    }
    Ok(count)
}

pub fn load_games() -> Result<Vec<Game>> {
    let conn = Connection::open(get_db_path())?;
    let mut stmt = conn.prepare(
        "SELECT id, title, system, rom_path FROM games ORDER BY title ASC"
    )?;
    let games = stmt.query_map([], |row| {
        Ok(Game {
            id: row.get(0)?,
            title: row.get(1)?,
            system: row.get(2)?,
            rom_path: row.get(3)?,
        })
    })?
    .filter_map(|g| g.ok())
    .collect();
    Ok(games)
}