import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Game } from "../types";
import { convertFileSrc } from "@tauri-apps/api/core";

const SYSTEM_COLORS: Record<string, string> = {
  "NES": "bg-red-500",
  "SNES": "bg-purple-500",
  "Game Boy": "bg-green-600",
  "Game Boy Color": "bg-green-400",
  "Game Boy Advance": "bg-indigo-500",
  "Nintendo 64": "bg-blue-500",
  "Sega Genesis": "bg-blue-700",
  "Game Gear": "bg-blue-400",
  "Master System": "bg-blue-600",
  "PlayStation": "bg-gray-600",
  "TurboGrafx-16": "bg-orange-500",
};

const SYSTEM_SHORT: Record<string, string> = {
  "NES": "NES",
  "SNES": "SNES",
  "Game Boy": "GB",
  "Game Boy Color": "GBC",
  "Game Boy Advance": "GBA",
  "Nintendo 64": "N64",
  "Sega Genesis": "GEN",
  "Game Gear": "GG",
  "Master System": "SMS",
  "PlayStation": "PS1",
  "TurboGrafx-16": "PCE",
};

interface Props {
  game: Game;
  onClick: (game: Game) => void;
}

export function GameTile({ game, onClick }: Props) {
  const [artPath, setArtPath] = useState<string | null>(null);
  const color = SYSTEM_COLORS[game.system] ?? "bg-gray-500";
  const short = SYSTEM_SHORT[game.system] ?? game.system;

  useEffect(() => {
    invoke<string | null>("fetch_art", {
      title: game.title,
      system: game.system,
    }).then((path) => {
      if (path) {
        setArtPath(convertFileSrc(path));
      }
    });
  }, [game.title, game.system]);

  return (
    <div
      onClick={() => onClick(game)}
      className="flex flex-col cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-all hover:shadow-md"
    >
      <div className={`${color} w-full aspect-[3/4] flex items-center justify-center overflow-hidden`}>
        {artPath ? (
          <img
            src={artPath}
            alt={game.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-2xl font-bold opacity-30">{short}</span>
        )}
      </div>
      <div className="p-2 bg-white">
        <p className="text-xs font-medium text-gray-800 truncate">{game.title}</p>
        <p className="text-xs text-gray-400">{short}</p>
      </div>
    </div>
  );
}