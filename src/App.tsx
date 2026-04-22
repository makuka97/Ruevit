import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";

interface ScannedGame {
  title: string;
  system: string;
  rom_path: string;
}

interface Game {
  id: number;
  title: string;
  system: string;
  rom_path: string;
}

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [folderPath, setFolderPath] = useState<string>("");
  const [retroarchPath, setRetroarchPath] = useState<string>(
    "C:\\RetroArch-Win64\\RetroArch-Win64\\retroarch.exe"
  );
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    loadLibrary();
  }, []);

  async function loadLibrary() {
    const result = await invoke<Game[]>("load_library");
    setGames(result);
  }

  async function scanAndSave() {
    try {
      setStatus("Scanning...");
      const scanned = await invoke<ScannedGame[]>("scan_roms", {
        folderPath: folderPath,
      });
      setStatus(`Found ${scanned.length} games, saving...`);
      const saveResult = await invoke<string>("save_library", {
        games: scanned,
      });
      setStatus(saveResult);
      await loadLibrary();
    } catch (e) {
      setStatus("Error: " + e);
    }
  }

  async function launchGame(game: Game) {
  try {
    await invoke("launch_game", {
      retroarchPath: retroarchPath,
      romPath: game.rom_path,
      system: game.system,
    });
    setStatus(`Launched ${game.title}`);
  } catch (e) {
    alert("Launch error: " + JSON.stringify(e));
  }
}

  return (
    <div className="flex flex-col items-center min-h-screen gap-4 p-8">
      <h1 className="text-2xl font-medium">Ruevit</h1>

      <div className="flex gap-2 w-full max-w-lg">
        <input
          type="text"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="ROM folder e.g. C:\ROMs"
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={scanAndSave}
          className="px-4 py-2 border rounded hover:bg-gray-100 text-sm"
        >
          Scan + Save
        </button>
      </div>

      <div className="w-full max-w-lg">
        <input
          type="text"
          value={retroarchPath}
          onChange={(e) => setRetroarchPath(e.target.value)}
          placeholder="RetroArch path"
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {status && (
        <p className="text-sm text-gray-500">{status}</p>
      )}

      {games.length > 0 && (
        <div className="w-full max-w-lg">
          <p className="text-sm text-gray-500 mb-2">
            {games.length} games in library
          </p>
          <div className="flex flex-col gap-2">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => launchGame(game)}
                className="border rounded px-4 py-2 flex justify-between cursor-pointer hover:bg-gray-50"
              >
                <span className="text-sm font-medium">{game.title}</span>
                <span className="text-sm text-gray-500">{game.system}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;