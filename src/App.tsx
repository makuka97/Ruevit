import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { GameTile } from "./components/GameTile";
import { Sidebar } from "./components/Sidebar";
import { Game } from "./types";

interface ScannedGame {
  title: string;
  system: string;
  rom_path: string;
}

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [folderPath, setFolderPath] = useState<string>("");
  const [retroarchPath] = useState<string>(
    "C:\\RetroArch-Win64\\RetroArch-Win64\\retroarch.exe"
  );
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedSystem, setSelectedSystem] = useState<string>("All");
  const [showSettings, setShowSettings] = useState<boolean>(false);

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
      await invoke<string>("save_library", { games: scanned });
      await loadLibrary();
      setStatus("");
      setShowSettings(false);
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
    } catch (e) {
      setStatus("Launch error: " + e);
    }
  }

  const systemCounts = games.reduce<Record<string, number>>((acc, g) => {
    acc[g.system] = (acc[g.system] ?? 0) + 1;
    return acc;
  }, {});

  const filtered = games.filter((g) => {
    const matchSystem = selectedSystem === "All" || g.system === selectedSystem;
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    return matchSystem && matchSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Ruevit</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="bg-transparent text-sm outline-none w-48 text-gray-700 placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            Add ROMs
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
          <input
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="ROM folder path e.g. C:\ROMs"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none"
          />
          <button
            onClick={scanAndSave}
            className="text-sm px-4 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700"
          >
            Scan + Save
          </button>
          {status && <p className="text-sm text-gray-500">{status}</p>}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden px-6 py-4 gap-6">
        <Sidebar
          selected={selectedSystem}
          onSelect={setSelectedSystem}
          counts={systemCounts}
        />

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p className="text-sm">No games found</p>
              <p className="text-xs mt-1">Click "Add ROMs" to scan a folder</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filtered.map((game) => (
                <GameTile
                  key={game.id}
                  game={game}
                  onClick={launchGame}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;